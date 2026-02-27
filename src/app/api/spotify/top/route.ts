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

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const rangeKey = (searchParams.get("range") || "7d").toLowerCase();
  const mapped = RANGE_MAP[rangeKey] || "short_term";

  try {
    const [tracks, artists, nowPlaying, recent] = await Promise.all([
      getTopTracks(session.accessToken, mapped, 20),
      getTopArtists(session.accessToken, mapped, 20),
      getCurrentlyPlaying(session.accessToken),
      getRecentlyPlayed(session.accessToken, 50),
    ]);

    const albums = deriveTopAlbums(tracks.items).slice(0, 20);
    const windowStats = aggregateByWindow(recent.items);

    return NextResponse.json({
      ok: true,
      range: rangeKey,
      sourceRange: mapped,
      nowPlaying,
      spotifyTop: {
        tracks: tracks.items,
        artists: artists.items,
        albums,
      },
      windowStats,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "Spotify fetch failed" },
      { status: 500 },
    );
  }
}
