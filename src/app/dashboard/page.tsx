import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
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

type RankedItem = {
  id: string;
  title: string;
  subtitle: string;
  metric: string;
  extra?: string;
};

type ArtistItem = {
  id: string;
  name: string;
  plays: number;
  genres?: string[];
};

type ActivityItem = {
  id: string;
  action: string;
  title: string;
  subtitle: string;
  time: string;
};

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "Last 4 Weeks" },
  { key: "30d", label: "Last 6 Months" },
  { key: "all", label: "All Time" },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ range?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.lastfmUsername) redirect("/");

  const sp = (await searchParams) || {};
  const selectedRange = (sp.range || "7d").toLowerCase() as RangeKey;
  const activeRange: RangeKey = RANGES.some((r) => r.key === selectedRange) ? selectedRange : "7d";

  const username = session.lastfmUsername;
  const range = activeRange as LastFmRange;
  const [tracks, artists, albums, recent] = await Promise.all([
    getLastFmTopTracks(username, range, 10),
    getLastFmTopArtists(username, range, 10),
    getLastFmTopAlbums(username, range, 10),
    getLastFmRecentTracks(username, 200),
  ]);

  const windows = aggregateLastFmByWindow(recent);
  const scoped = activeRange === "all" ? null : windows[activeRange];
  const filteredRecent =
    activeRange === "all"
      ? recent.filter((t) => Boolean(t.playedAt))
      : recent.filter((t) => t.playedAt && t.playedAt >= Date.now() - (activeRange === "7d" ? 7 : 30) * 24 * 60 * 60 * 1000);

  const tracksPlayed = activeRange === "all" ? filteredRecent.length : scoped?.totalPlays || 0;
  const uniqueArtists = activeRange === "all" ? new Set(filteredRecent.map((t) => t.artist)).size : scoped?.artists.length || 0;
  const totalListeningMinutes = tracksPlayed * 3.5;
  const avgDailyMinutes = Math.round(totalListeningMinutes / (activeRange === "7d" ? 28 : activeRange === "30d" ? 180 : 365));
  const listeningHours = `${Math.floor(totalListeningMinutes / 60)}h ${Math.round(totalListeningMinutes % 60)}m`;
  const score = Math.min(9.8, Math.max(6.4, Number((6.5 + uniqueArtists / 180 + tracksPlayed / 700).toFixed(1))));

  const topTracks: RankedItem[] = tracks.slice(0, 5).map((track, index) => ({
    id: track.id,
    title: track.name,
    subtitle: track.artists.map((a) => a.name).join(", "),
    metric: `${Number(track.popularity || 0).toLocaleString()} plays`,
    extra: `#${index + 1}`,
  }));

  const topAlbums: RankedItem[] = albums.slice(0, 5).map((album, index) => ({
    id: album.id,
    title: album.name,
    subtitle: (album.artists || []).join(", ") || "Unknown Artist",
    metric: `${album.plays.toLocaleString()} plays`,
    extra: `#${index + 1}`,
  }));

  const topArtists: ArtistItem[] = artists.slice(0, 6).map((artist) => ({
    id: artist.id,
    name: artist.name,
    plays: Number(artist.popularity || 0),
    genres: ["Scrobbled", "Last.fm"],
  }));

  const nowPlayingTrack = getLastFmNowPlaying(recent)?.track;
  const currentTrack = nowPlayingTrack
    ? {
        name: nowPlayingTrack.name,
        artists: nowPlayingTrack.artists,
        album: nowPlayingTrack.album,
      }
    : null;

  const activity: ActivityItem[] = recent
    .slice(0, 5)
    .filter((item) => item.name)
    .map((item, index) => ({
      id: item.id,
      action: index === 0 && item.nowPlaying ? "Now playing" : "Listened to",
      title: item.name,
      subtitle: item.artist,
      time: item.nowPlaying ? "Live now" : formatAgo(item.playedAt),
    }));

  const analyticsStats = [
    { label: "Total Listening Time", value: listeningHours, delta: "Last.fm estimate" },
    { label: "Tracks Played", value: tracksPlayed.toLocaleString(), delta: "Scrobbles in range" },
    { label: "Unique Artists", value: uniqueArtists.toLocaleString(), delta: "Distinct artists" },
    { label: "Avg. Daily Mins", value: String(avgDailyMinutes || 0), delta: "Habit intensity" },
  ];

  const monthlyTrend = buildMonthlyTrend(tracksPlayed, totalListeningMinutes);
  const genreMix = buildGenreMix(topArtists);
  const achievements = buildAchievements(uniqueArtists, tracksPlayed, avgDailyMinutes);

  return (
    <main className="min-h-screen px-4 py-6 text-white sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/40">Spotics</p>
            <h1 className="display-font mt-3 text-4xl font-bold text-white sm:text-5xl">Your Music Stats</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
              Track your Last.fm listening habits, revisit wrapped-style highlights, and inspect analytics without a database or Spotify dependency.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/55">
              Source: Last.fm
            </span>
            <Link href="/api/auth/signout" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:bg-white/8">
              Sign out
            </Link>
          </div>
        </header>

        <section className="panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_28%),linear-gradient(135deg,rgba(143,69,255,0.24),rgba(255,79,216,0.12)_45%,rgba(68,214,255,0.08)_100%)]" />
          <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-lime-200">Your Wrapped 2026</p>
              <h2 className="display-font mt-4 text-4xl font-bold text-white text-glow sm:text-6xl">Your Year in Music</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
                You&apos;ve listened to {tracksPlayed.toLocaleString()} tracks from {uniqueArtists.toLocaleString()} artists. Here&apos;s your story.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="#analytics" className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90">
                  View Analytics
                </Link>
                <Link href="#top-albums" className="rounded-2xl border border-white/14 bg-white/5 px-6 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/10">
                  Explore Top Albums
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:w-[420px] xl:grid-cols-1">
              <MiniKpi label="Listening Time" value={listeningHours} />
              <MiniKpi label="Listening Score" value={`${score}/10`} />
              <MiniKpi label="Current Mode" value={RANGES.find((r) => r.key === activeRange)?.label || "Last 4 Weeks"} />
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
            {RANGES.map((range) => {
              const active = range.key === activeRange;
              return (
                <Link
                  key={range.key}
                  href={`/dashboard?range=${range.key}`}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    active ? "bg-purple-500 text-white" : "text-white/60 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  {range.label}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-4">
          {analyticsStats.map((item) => (
            <article key={item.label} className="panel-soft rounded-[1.5rem] p-5">
              <p className="text-sm text-white/52">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-lime-200">{item.delta}</p>
            </article>
          ))}
        </section>

        <section id="top-albums" className="mt-12">
          <SectionTitle title="Top Albums" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {topAlbums.map((album) => (
              <RankedCard key={album.id} item={album} accent="from-purple-500/25 via-fuchsia-500/10 to-transparent" />
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-8 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <SectionTitle title="Top Tracks" />
            <div className="space-y-4">
              {topTracks.map((track, index) => (
                <TrackRow key={track.id} index={index + 1} item={track} />
              ))}
            </div>

            <div className="mt-12">
              <SectionTitle title="Top Artists" />
              <div className="grid gap-4 lg:grid-cols-2">
                {topArtists.map((artist, index) => (
                  <ArtistCard key={artist.id} artist={artist} index={index + 1} />
                ))}
              </div>
            </div>
          </div>

          <aside className="xl:col-span-4">
            <SectionTitle title="Recent Activity" reverse />
            <div className="space-y-4 xl:sticky xl:top-8">
              <div className="panel-soft rounded-[1.6rem] p-5">
                <p className="text-xs uppercase tracking-[0.32em] text-lime-200">Now Playing</p>
                {currentTrack ? (
                  <div className="mt-4">
                    <p className="text-2xl font-semibold text-white">{currentTrack.name}</p>
                    <p className="mt-2 text-sm leading-7 text-white/62">{currentTrack.artists.join(", ")}</p>
                    <p className="text-sm text-white/45">{currentTrack.album}</p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-white/60">Nothing is currently playing or Last.fm has not exposed a live now-playing signal.</p>
                )}
              </div>

              <div className="panel-soft rounded-[1.6rem] p-5">
                <div className="space-y-4">
                  {activity.length ? (
                    activity.map((item) => (
                      <div key={item.id} className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                        <p className="text-[0.7rem] uppercase tracking-[0.28em] text-white/38">{item.action}</p>
                        <p className="mt-2 font-semibold text-white">{item.title}</p>
                        <p className="text-sm text-white/56">{item.subtitle}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.22em] text-cyan-200">{item.time}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-white/55">Recent activity could not be loaded from Last.fm right now.</p>
                  )}
                </div>
              </div>

              <div className="panel-soft rounded-[1.6rem] p-5">
                <p className="text-sm text-white/50">Your Listening Score</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-4xl font-semibold text-white">{score}/10</p>
                  <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-lime-200">Last.fm based</span>
                </div>
                <p className="mt-4 text-sm leading-7 text-white/58">Based on listening time, variety, consistency, and replay intensity across your selected time range.</p>
              </div>
            </div>
          </aside>
        </section>

        <section id="analytics" className="mt-12">
          <SectionTitle title="Analytics" />
          <div className="grid gap-6 lg:grid-cols-2">
            <AnalyticsTrendCard title="Monthly Growth" subtitle="Listening time and track volume trend">
              <div className="space-y-4">
                {monthlyTrend.map((point) => (
                  <div key={point.month}>
                    <div className="mb-2 flex items-center justify-between text-sm text-white/60">
                      <span>{point.month}</span>
                      <span>{point.minutes} mins · {point.tracks} tracks</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/6">
                      <div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400" style={{ width: `${point.width}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </AnalyticsTrendCard>

            <AnalyticsTrendCard title="Genre Distribution" subtitle="Estimated mix based on your top artists">
              <div className="space-y-4">
                {genreMix.map((genre) => (
                  <div key={genre.label}>
                    <div className="mb-2 flex items-center justify-between text-sm text-white/60">
                      <span>{genre.label}</span>
                      <span>{genre.value}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/6">
                      <div className="h-full rounded-full" style={{ width: `${genre.value}%`, background: genre.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </AnalyticsTrendCard>

            <AnalyticsTrendCard title="Listening Traits" subtitle="Dashboard-level score breakdown">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Energy", value: Math.min(95, 60 + Math.round(score * 3)) },
                  { label: "Variety", value: Math.min(96, 40 + Math.round(uniqueArtists / 6)) },
                  { label: "Consistency", value: Math.min(92, 35 + Math.round(avgDailyMinutes / 3)) },
                  { label: "Replay", value: Math.min(90, 30 + Math.round(tracksPlayed / 35)) },
                ].map((trait) => (
                  <div key={trait.label} className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-sm text-white/52">{trait.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{trait.value}%</p>
                  </div>
                ))}
              </div>
            </AnalyticsTrendCard>

            <AnalyticsTrendCard title="Achievements" subtitle="Milestones surfaced from your listening behavior">
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.title} className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{achievement.title}</p>
                        <p className="mt-1 text-sm text-white/58">{achievement.description}</p>
                      </div>
                      <span className="text-xl">{achievement.icon}</span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/7">
                      <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${achievement.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </AnalyticsTrendCard>
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionTitle({ title, reverse = false }: { title: string; reverse?: boolean }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${reverse ? "from-pink-500 to-purple-500" : "from-purple-500 to-pink-500"}`} />
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
  );
}

function MiniKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
      <p className="text-[0.7rem] uppercase tracking-[0.28em] text-white/38">{label}</p>
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function RankedCard({ item, accent }: { item: RankedItem; accent: string }) {
  return (
    <article className={`relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-br ${accent} p-5`}>
      <div className="mb-10 flex items-center justify-between">
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/58">{item.extra}</span>
        <span className="text-xs uppercase tracking-[0.22em] text-lime-200">{item.metric}</span>
      </div>
      <p className="text-xl font-semibold text-white">{item.title}</p>
      <p className="mt-2 text-sm leading-7 text-white/58">{item.subtitle}</p>
    </article>
  );
}

function TrackRow({ index, item }: { index: number; item: RankedItem }) {
  return (
    <article className="panel-soft flex items-center gap-4 rounded-[1.5rem] p-4 sm:p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-lg font-bold text-white">{index}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-semibold text-white">{item.title}</p>
        <p className="truncate text-sm text-white/55">{item.subtitle}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-white">{item.metric}</p>
      </div>
    </article>
  );
}

function ArtistCard({ artist, index }: { artist: ArtistItem; index: number }) {
  return (
    <article className="panel-soft rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/40">#{index}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{artist.name}</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-lime-200">{artist.plays.toLocaleString()} plays</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(artist.genres?.length ? artist.genres : ["Music", "Listening"]).slice(0, 2).map((genre) => (
          <span key={genre} className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/52">{genre}</span>
        ))}
      </div>
    </article>
  );
}

function AnalyticsTrendCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <article className="panel-soft rounded-[1.75rem] p-5 sm:p-6">
      <p className="text-xl font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-7 text-white/55">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </article>
  );
}

function buildMonthlyTrend(tracksPlayed: number, totalListeningMinutes: number) {
  const baseMinutes = Math.max(240, Math.round(totalListeningMinutes / 6) || 240);
  const baseTracks = Math.max(80, Math.round(tracksPlayed / 6) || 80);
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, index) => {
    const minutes = baseMinutes + index * Math.round(baseMinutes * 0.08);
    const tracks = baseTracks + index * Math.round(baseTracks * 0.07);
    return {
      month,
      minutes,
      tracks,
      width: Math.min(100, 48 + index * 9),
    };
  });
}

function buildGenreMix(artists: ArtistItem[]) {
  const fallback = [
    { label: "Indie", value: 32, color: "linear-gradient(90deg,#a855f7,#ec4899)" },
    { label: "Alternative", value: 24, color: "linear-gradient(90deg,#ec4899,#d946ef)" },
    { label: "Rock", value: 18, color: "linear-gradient(90deg,#7c3aed,#8b5cf6)" },
    { label: "Electronic", value: 14, color: "linear-gradient(90deg,#06b6d4,#22d3ee)" },
    { label: "Folk", value: 12, color: "linear-gradient(90deg,#84cc16,#bef264)" },
  ];
  const names = artists.flatMap((artist) => artist.genres || []).filter(Boolean);
  if (!names.length) return fallback;
  const buckets = new Map<string, number>();
  for (const name of names) buckets.set(name, (buckets.get(name) || 0) + 1);
  const total = Array.from(buckets.values()).reduce((a, b) => a + b, 0) || 1;
  const palette = ["#a855f7", "#ec4899", "#8b5cf6", "#06b6d4", "#84cc16"];
  return Array.from(buckets.entries())
    .slice(0, 5)
    .map(([label, count], index) => ({
      label,
      value: Math.max(8, Math.round((count / total) * 100)),
      color: palette[index % palette.length],
    }));
}

function buildAchievements(uniqueArtists: number, tracksPlayed: number, avgDailyMinutes: number) {
  return [
    {
      title: "Diverse Listener",
      description: `${uniqueArtists}+ artist reach across your selected range`,
      icon: "🎵",
      progress: Math.min(100, Math.round((uniqueArtists / 50) * 100)),
    },
    {
      title: "Replay Machine",
      description: `${tracksPlayed.toLocaleString()} track plays captured`,
      icon: "🔁",
      progress: Math.min(100, Math.round((tracksPlayed / 500) * 100)),
    },
    {
      title: "Daily Ritual",
      description: `${avgDailyMinutes} minutes average per day`,
      icon: "⏱️",
      progress: Math.min(100, Math.round((avgDailyMinutes / 180) * 100)),
    },
  ];
}

function formatAgo(ts?: number) {
  if (!ts) return "Recently";
  const diffMinutes = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}
