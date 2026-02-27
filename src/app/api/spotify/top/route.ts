import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import {
  aggregateByWindow,
  deriveTopAlbums,
  getCurrentlyPlaying,
  getRecentlyPlayed,
  getTopArtists,
  getTopTracks,
  TimeRange,
} from "@/lib/spotify";

const RANGE_MAP: Record<string, TimeRange> = {
  "24h": "short_term",
  "7d": "short_term",
  "30d": "medium_term",
  short: "short_term",
  medium: "medium_term",
  long: "long_term",
};

function errMsg(reason: unknown) {
  if (reason instanceof Error) return reason.message;
  return "unknown_error";
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const rangeKey = (searchParams.get("range") || "7d").toLowerCase();
  const mapped = RANGE_MAP[rangeKey] || "short_term";

  const [tracksRes, artistsRes, nowPlayingRes, recentRes] = await Promise.allSettled([
    getTopTracks(session.accessToken, mapped, 20),
    getTopArtists(session.accessToken, mapped, 20),
    getCurrentlyPlaying(session.accessToken),
    getRecentlyPlayed(session.accessToken, 50),
  ]);

  const tracks = tracksRes.status === "fulfilled" ? tracksRes.value.items : [];
  const artists = artistsRes.status === "fulfilled" ? artistsRes.value.items : [];
  const albums = tracks.length ? deriveTopAlbums(tracks).slice(0, 20) : [];
  const windowStats =
    recentRes.status === "fulfilled"
      ? aggregateByWindow(recentRes.value.items)
      : {
          "24h": { tracks: [], artists: [], albums: [], totalPlays: 0 },
          "7d": { tracks: [], artists: [], albums: [], totalPlays: 0 },
          "30d": { tracks: [], artists: [], albums: [], totalPlays: 0 },
        };

  const errors: Record<string, string> = {};
  if (tracksRes.status === "rejected") errors.topTracks = errMsg(tracksRes.reason);
  if (artistsRes.status === "rejected") errors.topArtists = errMsg(artistsRes.reason);
  if (nowPlayingRes.status === "rejected") errors.nowPlaying = errMsg(nowPlayingRes.reason);
  if (recentRes.status === "rejected") errors.recentlyPlayed = errMsg(recentRes.reason);

  const limitedMode = Object.keys(errors).length > 0;
  const fullyUnavailable = !tracks.length && !artists.length && recentRes.status === "rejected";

  return NextResponse.json(
    {
      ok: !fullyUnavailable,
      range: rangeKey,
      sourceRange: mapped,
      limitedMode,
      errors,
      nowPlaying: nowPlayingRes.status === "fulfilled" ? nowPlayingRes.value : null,
      spotifyTop: {
        tracks,
        artists,
        albums,
      },
      windowStats,
    },
    { status: fullyUnavailable ? 503 : 200 },
  );
}
