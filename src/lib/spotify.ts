export type TimeRange = "short_term" | "medium_term" | "long_term";

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
