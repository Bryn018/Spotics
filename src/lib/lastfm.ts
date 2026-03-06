export type LastFmRange = "24h" | "7d" | "30d" | "all";

type LastFmImage = { '#text': string; size: string };

type LastFmRecentTrackRaw = {
  name: string;
  artist: { '#text': string } | string;
  album?: { '#text': string };
  image?: LastFmImage[];
  url?: string;
  date?: { uts: string };
  '@attr'?: { nowplaying?: string };
};

export type LastFmTrack = {
  id: string;
  name: string;
  artist: string;
  album: string;
  image?: string;
  url?: string;
  playedAt?: number;
  nowPlaying?: boolean;
};

export type LastFmArtist = {
  id: string;
  name: string;
  plays: number;
  url?: string;
};

const API_BASE = "https://ws.audioscrobbler.com/2.0/";

function requireApiKey() {
  const key = process.env.LASTFM_API_KEY;
  if (!key) throw new Error("LASTFM_API_KEY is missing");
  return key;
}

async function callLastFm<T>(params: Record<string, string | number>): Promise<T> {
  const apiKey = requireApiKey();
  const qs = new URLSearchParams({
    api_key: apiKey,
    format: "json",
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });

  const res = await fetch(`${API_BASE}?${qs.toString()}`, { cache: "no-store" });
  const json = await res.json();

  if (!res.ok || json?.error) {
    throw new Error(json?.message || `Last.fm API ${res.status}`);
  }

  return json as T;
}

function artistText(value: LastFmRecentTrackRaw["artist"]) {
  return typeof value === "string" ? value : value?.['#text'] || "Unknown Artist";
}

function bestImage(images?: LastFmImage[]) {
  if (!images?.length) return undefined;
  return images[images.length - 1]?.['#text'] || undefined;
}

function normalizeRecentTrack(t: LastFmRecentTrackRaw): LastFmTrack {
  const artist = artistText(t.artist);
  const album = t.album?.['#text'] || "Unknown Album";
  const playedAt = t.date?.uts ? Number(t.date.uts) * 1000 : undefined;
  return {
    id: `${t.name}:${artist}:${playedAt || "now"}`,
    name: t.name,
    artist,
    album,
    image: bestImage(t.image),
    url: t.url,
    playedAt,
    nowPlaying: t['@attr']?.nowplaying === "true",
  };
}

export async function validateLastFmUser(username: string) {
  const json = await callLastFm<{ user: { name: string } }>({
    method: "user.getinfo",
    user: username,
  });
  return json.user?.name;
}

export async function getLastFmRecentTracks(username: string, limit = 200) {
  const json = await callLastFm<{ recenttracks: { track: LastFmRecentTrackRaw[] | LastFmRecentTrackRaw } }>({
    method: "user.getrecenttracks",
    user: username,
    limit: Math.min(limit, 200),
  });

  const raw = json.recenttracks?.track || [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map(normalizeRecentTrack);
}

function toLastFmPeriod(range: LastFmRange) {
  if (range === "all") return "overall";
  if (range === "30d") return "1month";
  return "7day";
}

export async function getLastFmTopTracks(username: string, range: LastFmRange, limit = 20) {
  const period = toLastFmPeriod(range);
  const json = await callLastFm<{ toptracks: { track: Array<{ name: string; playcount: string; url?: string; artist: { name: string } }> } }>({
    method: "user.gettoptracks",
    user: username,
    period,
    limit: Math.min(limit, 50),
  });

  return (json.toptracks?.track || []).map((t, idx) => ({
    id: `${t.name}:${t.artist?.name}:${idx}`,
    name: t.name,
    artists: [{ name: t.artist?.name || "Unknown Artist" }],
    album: { id: `na-${idx}`, name: "N/A", images: [] as Array<{ url: string }> },
    popularity: Number(t.playcount) || 0,
    external_urls: { spotify: t.url },
  }));
}

export async function getLastFmTopArtists(username: string, range: LastFmRange, limit = 20) {
  const period = toLastFmPeriod(range);
  const json = await callLastFm<{ topartists: { artist: Array<{ name: string; playcount: string; url?: string }> } }>({
    method: "user.gettopartists",
    user: username,
    period,
    limit: Math.min(limit, 50),
  });

  return (json.topartists?.artist || []).map((a, idx) => ({
    id: `${a.name}:${idx}`,
    name: a.name,
    genres: [] as string[],
    images: [] as Array<{ url: string }>,
    popularity: Number(a.playcount) || 0,
    external_urls: { spotify: a.url },
  }));
}

export async function getLastFmTopAlbums(username: string, range: LastFmRange, limit = 20) {
  const period = toLastFmPeriod(range);
  const json = await callLastFm<{
    topalbums: {
      album: Array<{ name: string; playcount: string; url?: string; artist: { name: string } }>;
    };
  }>({
    method: "user.gettopalbums",
    user: username,
    period,
    limit: Math.min(limit, 50),
  });

  return (json.topalbums?.album || []).map((a, idx) => ({
    id: `${a.name}:${a.artist?.name || "Unknown Artist"}:${idx}`,
    name: a.name,
    plays: Number(a.playcount) || 0,
    artists: [a.artist?.name || "Unknown Artist"],
    image: undefined as string | undefined,
    url: a.url,
  }));
}

export function getLastFmNowPlaying(recentTracks: LastFmTrack[]) {
  const now = recentTracks.find((t) => t.nowPlaying);
  if (!now) return null;

  return {
    isPlaying: true,
    progressMs: null,
    track: {
      name: now.name,
      artists: [now.artist],
      album: now.album,
      image: now.image,
      url: now.url,
    },
  };
}

export function aggregateLastFmByWindow(recentTracks: LastFmTrack[]) {
  const now = Date.now();
  const cutoffs = {
    "24h": now - 24 * 60 * 60 * 1000,
    "7d": now - 7 * 24 * 60 * 60 * 1000,
    "30d": now - 30 * 24 * 60 * 60 * 1000,
  } as const;

  type WindowTrack = { id: string; name: string; plays: number; artists?: string[]; image?: string; url?: string };
  type WindowArtist = { id: string; name: string; plays: number };
  type WindowAlbum = { id: string; name: string; plays: number; artists?: string[]; image?: string };
  type WindowData = { tracks: WindowTrack[]; artists: WindowArtist[]; albums: WindowAlbum[]; totalPlays: number };

  const result: Record<"24h" | "7d" | "30d", WindowData> = {
    "24h": { tracks: [], artists: [], albums: [], totalPlays: 0 },
    "7d": { tracks: [], artists: [], albums: [], totalPlays: 0 },
    "30d": { tracks: [], artists: [], albums: [], totalPlays: 0 },
  };

  for (const key of Object.keys(cutoffs) as Array<"24h" | "7d" | "30d">) {
    const filtered = recentTracks.filter((t) => t.playedAt && t.playedAt >= cutoffs[key]);

    const trackMap = new Map<string, { id: string; name: string; plays: number; artists: string[]; image?: string; url?: string }>();
    const artistMap = new Map<string, { id: string; name: string; plays: number }>();
    const albumMap = new Map<string, { id: string; name: string; plays: number; artists: string[]; image?: string }>();

    for (const t of filtered) {
      const trackId = `${t.name}:${t.artist}`;
      const te = trackMap.get(trackId) || {
        id: trackId,
        name: t.name,
        plays: 0,
        artists: [t.artist],
        image: t.image,
        url: t.url,
      };
      te.plays += 1;
      trackMap.set(trackId, te);

      const ae = artistMap.get(t.artist) || { id: t.artist, name: t.artist, plays: 0 };
      ae.plays += 1;
      artistMap.set(t.artist, ae);

      const albumId = `${t.album}:${t.artist}`;
      const al = albumMap.get(albumId) || {
        id: albumId,
        name: t.album,
        plays: 0,
        artists: [t.artist],
        image: t.image,
      };
      al.plays += 1;
      albumMap.set(albumId, al);
    }

    const sort = <T extends { plays: number }>(arr: T[]) => arr.sort((a, b) => b.plays - a.plays);
    result[key] = {
      tracks: sort(Array.from(trackMap.values())),
      artists: sort(Array.from(artistMap.values())),
      albums: sort(Array.from(albumMap.values())),
      totalPlays: filtered.length,
    };
  }

  return result;
}
