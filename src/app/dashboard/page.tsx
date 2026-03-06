import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
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
import {
  aggregateLastFmByWindow,
  getLastFmNowPlaying,
  getLastFmRecentTracks,
  getLastFmTopAlbums,
  getLastFmTopArtists,
  getLastFmTopTracks,
  LastFmRange,
} from "@/lib/lastfm";

type RangeKey = "7d" | "30d" | "all";

const SPOTIFY_RANGE_MAP: Record<RangeKey, TimeRange> = {
  "7d": "short_term",
  "30d": "medium_term",
  all: "long_term",
};

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "all", label: "ALL TIME" },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ range?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken && !session?.lastfmUsername) redirect("/");

  const sp = (await searchParams) || {};
  const selectedRange = (sp.range || "7d").toLowerCase() as RangeKey;
  const activeRange: RangeKey = RANGES.some((r) => r.key === selectedRange) ? selectedRange : "7d";

  let topTracks: string[] = [];
  let topArtists: string[] = [];
  let topAlbums: string[] = [];
  let nowPlaying: { track: { name: string; artists: string[]; album: string }; isPlaying: boolean } | null = null;
  let totalPlays = 0;
  let sourceLabel = session.provider === "lastfm" ? "Last.fm" : "Spotify";

  if (session.provider === "lastfm" && session.lastfmUsername) {
    const range = activeRange as LastFmRange;

    const [tracks, artists, albums, recent] = await Promise.all([
      getLastFmTopTracks(session.lastfmUsername, range, 10),
      getLastFmTopArtists(session.lastfmUsername, range, 10),
      getLastFmTopAlbums(session.lastfmUsername, range, 10),
      getLastFmRecentTracks(session.lastfmUsername, 200),
    ]);

    topTracks = tracks.slice(0, 10).map((t, i) => `#${i + 1} ${t.name} — ${t.artists.map((a) => a.name).join(", ")}`);
    topArtists = artists.slice(0, 10).map((a, i) => `#${i + 1} ${a.name}`);
    topAlbums = albums.slice(0, 10).map((a, i) => `#${i + 1} ${a.name} — ${(a.artists || []).join(", ")}`);

    nowPlaying = getLastFmNowPlaying(recent);

    if (activeRange === "all") {
      totalPlays = recent.filter((r) => Boolean(r.playedAt)).length;
    } else {
      const windows = aggregateLastFmByWindow(recent);
      totalPlays = windows[activeRange].totalPlays;
    }
  } else if (session.accessToken) {
    const mappedRange = SPOTIFY_RANGE_MAP[activeRange];
    const [tracksRes, artistsRes, nowPlayingRes, recentRes] = await Promise.allSettled([
      getTopTracks(session.accessToken, mappedRange, 50),
      getTopArtists(session.accessToken, mappedRange, 50),
      getCurrentlyPlaying(session.accessToken),
      getRecentlyPlayed(session.accessToken, 50),
    ]);

    const tracks = tracksRes.status === "fulfilled" ? tracksRes.value.items : [];
    const artists = artistsRes.status === "fulfilled" ? artistsRes.value.items : [];
    const albums = deriveTopAlbums(tracks).slice(0, 10);

    topTracks = tracks.slice(0, 10).map((t, i) => `#${i + 1} ${t.name} — ${t.artists.map((a) => a.name).join(", ")}`);
    topArtists = artists.slice(0, 10).map((a, i) => `#${i + 1} ${a.name}`);
    topAlbums = albums.map((a, i) => `#${i + 1} ${a.name} — ${(a.artists || []).join(", ")}`);

    nowPlaying = nowPlayingRes.status === "fulfilled" ? nowPlayingRes.value : null;

    if (recentRes.status === "fulfilled") {
      const windows = aggregateByWindow(recentRes.value.items);
      totalPlays = activeRange === "all" ? recentRes.value.items.length : windows[activeRange].totalPlays;
    }

    sourceLabel = "Spotify";
  }

  return (
    <main className="min-h-screen bg-[#070611] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-200">Spotics Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold">Top 10 Music Insights</h1>
          <p className="mt-2 text-white/70">Source: {sourceLabel}</p>
        </div>

        <div className="mb-6 rounded-2xl border border-green-400/30 bg-green-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-green-200">Now Playing</p>
          {nowPlaying?.track ? (
            <div className="mt-2">
              <p className="text-xl font-semibold">{nowPlaying.track.name}</p>
              <p className="text-sm text-white/75">
                {nowPlaying.track.artists.join(", ")} • {nowPlaying.track.album}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-white/70">Unavailable or nothing currently playing.</p>
          )}
        </div>

        <section className="mb-4 flex flex-wrap items-center gap-3">
          {RANGES.map((r) => {
            const active = activeRange === r.key;
            return (
              <Link
                key={r.key}
                href={`/dashboard?range=${r.key}`}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  active ? "bg-white text-black" : "border border-white/20 text-white/80 hover:bg-white/10"
                }`}
              >
                {r.label}
              </Link>
            );
          })}
        </section>

        <p className="mb-6 text-xs text-white/60">
          Plays counted for selected range: <span className="font-semibold text-white">{totalPlays}</span>
        </p>

        <div className="grid gap-6 lg:grid-cols-3">
          <Column title={`Top 10 Songs (${activeRange.toUpperCase()})`} items={topTracks} />
          <Column title={`Top 10 Artists (${activeRange.toUpperCase()})`} items={topArtists} />
          <Column title={`Top 10 Albums (${activeRange.toUpperCase()})`} items={topAlbums} />
        </div>
      </div>
    </main>
  );
}

function Column({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="mb-4 text-lg font-semibold text-cyan-200">{title}</h2>
      <ol className="space-y-2 text-sm text-white/90">
        {items.length ? (
          items.map((item) => (
            <li key={item} className="rounded-lg border border-white/10 p-2">
              {item}
            </li>
          ))
        ) : (
          <li className="rounded-lg border border-white/10 p-2 text-white/60">No available data for this section.</li>
        )}
      </ol>
    </section>
  );
}
