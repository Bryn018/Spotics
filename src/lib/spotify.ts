export type TimeRange = "short_term" | "medium_term" | "long_term";
export type WindowKey = "24h" | "7d" | "30d";

type SpotifyImage = { url: string };

export type TopTrack = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { id: string; name: string; images: SpotifyImage[] };
  popularity: number;
  external_urls?: { spotify?: string };
};

export type TopArtist = {
  id: string;
  name: string;
  genres: string[];
  images: SpotifyImage[];
  popularity: number;
  external_urls?: { spotify?: string };
};

type RecentlyPlayedResponse = {
  items: Array<{
    played_at: string;
    track: TopTrack;
  }>;
};

type WindowAggItem = {
  id: string;
  name: string;
  plays: number;
  image?: string;
  artists?: string[];
  url?: string;
};

async function spotifyFetch<T>(accessToken: string, path: string): Promise<T> {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Spotify API ${res.status}: ${msg}`);
  }

  return res.json() as Promise<T>;
}

export async function getTopTracks(accessToken: string, range: TimeRange, limit = 20) {
  return spotifyFetch<{ items: TopTrack[] }>(
    accessToken,
    `/me/top/tracks?time_range=${range}&limit=${Math.min(limit, 50)}`,
  );
}

export async function getTopArtists(accessToken: string, range: TimeRange, limit = 20) {
  return spotifyFetch<{ items: TopArtist[] }>(
    accessToken,
    `/me/top/artists?time_range=${range}&limit=${Math.min(limit, 50)}`,
  );
}

export async function getRecentlyPlayed(accessToken: string, limit = 50) {
  return spotifyFetch<RecentlyPlayedResponse>(
    accessToken,
    `/me/player/recently-played?limit=${Math.min(limit, 50)}`,
  );
}

export async function getCurrentlyPlaying(accessToken: string) {
  const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (res.status === 204) return null;
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Spotify API ${res.status}: ${msg}`);
  }

  const json = await res.json();
  if (!json?.item) return null;

  return {
    isPlaying: Boolean(json.is_playing),
    progressMs: json.progress_ms as number | null,
    track: {
      name: json.item.name as string,
      artists: (json.item.artists || []).map((a: { name: string }) => a.name),
      album: json.item.album?.name as string,
      image: json.item.album?.images?.[0]?.url as string | undefined,
      url: json.item.external_urls?.spotify as string | undefined,
    },
  };
}

export function deriveTopAlbums(topTracks: TopTrack[]) {
  const map = new Map<
    string,
    { id: string; name: string; image?: string; plays: number; artists: Set<string>; url?: string }
  >();

  for (const track of topTracks) {
    const albumId = track.album?.id;
    if (!albumId) continue;
    const entry = map.get(albumId) ?? {
      id: albumId,
      name: track.album.name,
      image: track.album.images?.[0]?.url,
      plays: 0,
      artists: new Set<string>(),
      url: track.external_urls?.spotify,
    };
    entry.plays += 1;
    for (const a of track.artists || []) entry.artists.add(a.name);
    map.set(albumId, entry);
  }

  return Array.from(map.values())
    .sort((a, b) => b.plays - a.plays)
    .map((a) => ({ ...a, artists: Array.from(a.artists) }));
}

export function aggregateByWindow(recentItems: RecentlyPlayedResponse["items"]) {
  const now = Date.now();
  const cutoffs: Record<WindowKey, number> = {
    "24h": now - 24 * 60 * 60 * 1000,
    "7d": now - 7 * 24 * 60 * 60 * 1000,
    "30d": now - 30 * 24 * 60 * 60 * 1000,
  };

  const result: Record<
    WindowKey,
    {
      tracks: WindowAggItem[];
      artists: WindowAggItem[];
      albums: WindowAggItem[];
      totalPlays: number;
    }
  > = {
    "24h": { tracks: [], artists: [], albums: [], totalPlays: 0 },
    "7d": { tracks: [], artists: [], albums: [], totalPlays: 0 },
    "30d": { tracks: [], artists: [], albums: [], totalPlays: 0 },
  };

  for (const windowKey of Object.keys(cutoffs) as WindowKey[]) {
    const cutoff = cutoffs[windowKey];
    const filtered = recentItems.filter((i) => new Date(i.played_at).getTime() >= cutoff);

    const trackMap = new Map<string, WindowAggItem>();
    const artistMap = new Map<string, WindowAggItem>();
    const albumMap = new Map<string, WindowAggItem>();

    for (const item of filtered) {
      const t = item.track;
      if (!t?.id) continue;

      const tEntry = trackMap.get(t.id) ?? {
        id: t.id,
        name: t.name,
        plays: 0,
        image: t.album?.images?.[0]?.url,
        artists: (t.artists || []).map((a) => a.name),
        url: t.external_urls?.spotify,
      };
      tEntry.plays += 1;
      trackMap.set(t.id, tEntry);

      for (const a of t.artists || []) {
        const key = a.name;
        const aEntry = artistMap.get(key) ?? {
          id: key,
          name: a.name,
          plays: 0,
        };
        aEntry.plays += 1;
        artistMap.set(key, aEntry);
      }

      const albumId = t.album?.id ?? `${t.album?.name || "unknown"}-${t.id}`;
      const alEntry = albumMap.get(albumId) ?? {
        id: albumId,
        name: t.album?.name || "Unknown Album",
        plays: 0,
        image: t.album?.images?.[0]?.url,
        artists: (t.artists || []).map((a) => a.name),
      };
      alEntry.plays += 1;
      albumMap.set(albumId, alEntry);
    }

    const sortByPlays = (arr: WindowAggItem[]) => arr.sort((a, b) => b.plays - a.plays);

    result[windowKey] = {
      tracks: sortByPlays(Array.from(trackMap.values())),
      artists: sortByPlays(Array.from(artistMap.values())),
      albums: sortByPlays(Array.from(albumMap.values())),
      totalPlays: filtered.length,
    };
  }

  return result;
}
