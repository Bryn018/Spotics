import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import TopNav from "@/components/top-nav";
import SyncStatusCard from "@/components/sync-status-card";
import { getPersistedDashboardData, type DashboardRange } from "@/lib/dashboard-data";
import { ensureFreshSync, formatSyncTime } from "@/lib/sync-status";

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

const RANGES: { key: DashboardRange; label: string }[] = [
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
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
  const selectedRange = (sp.range || "7d").toLowerCase() as DashboardRange;
  const activeRange: DashboardRange = RANGES.some((r) => r.key === selectedRange) ? selectedRange : "7d";

  const syncState = await ensureFreshSync(session.lastfmUsername, 15 * 60 * 1000);
  const data = await getPersistedDashboardData(session.lastfmUsername, activeRange);

  const score = Math.min(9.8, Math.max(6.2, Number((6.3 + data.uniqueArtists / 160 + data.totalPlays / 650).toFixed(1))));

  const topTracks: RankedItem[] = data.topTracks.map((track, index) => ({
    id: track.id,
    title: track.title,
    subtitle: track.subtitle,
    metric: `${track.plays.toLocaleString()} plays`,
    extra: `#${index + 1}`,
  }));

  const topAlbums: RankedItem[] = data.topAlbums.map((album, index) => ({
    id: album.id,
    title: album.title,
    subtitle: album.subtitle,
    metric: `${album.plays.toLocaleString()} plays`,
    extra: `#${index + 1}`,
  }));

  const topArtists: ArtistItem[] = data.topArtists.map((artist) => ({
    id: artist.id,
    name: artist.name,
    plays: artist.plays,
    genres: ["Last.fm profile", "Persisted"],
  }));

  const analyticsStats = [
    { label: "Estimated Listening Time", value: data.totalListeningHours, delta: `${data.comparison.deltas.minutes >= 0 ? "+" : ""}${data.comparison.deltas.minutes}% vs previous period` },
    { label: "Scrobbles", value: data.totalPlays.toLocaleString(), delta: `${data.comparison.deltas.scrobbles >= 0 ? "+" : ""}${data.comparison.deltas.scrobbles}% vs previous period` },
    { label: "Unique Artists", value: data.uniqueArtists.toLocaleString(), delta: `${data.comparison.deltas.artists >= 0 ? "+" : ""}${data.comparison.deltas.artists}% vs previous period` },
    { label: "Avg. Daily Minutes", value: String(data.avgDailyMinutes || 0), delta: "Estimated habit intensity" },
  ];

  return (
    <main className="min-h-screen px-4 py-6 text-white sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1400px]">
        <TopNav />
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/40">Spotics</p>
            <h1 className="display-font mt-3 text-4xl font-bold text-white sm:text-5xl">Your Listening Dashboard</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
              This dashboard is now backed by persisted Last.fm scrobbles, period snapshots, and comparison-aware insights. Metrics are framed as exact counts where possible and estimates where estimation is being used.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/55">
              Source: Last.fm
            </span>
            <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-lime-200">
              Last sync {formatSyncTime(syncState.lastSuccessfulSyncAt)}
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
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-lime-200">Listening history, not fake wrap-up math</p>
              <h2 className="display-font mt-4 text-4xl font-bold text-white text-glow sm:text-6xl">Your music activity</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
                You&apos;ve logged {data.totalPlays.toLocaleString()} scrobbles from {data.uniqueArtists.toLocaleString()} artists in this range. Spotics is now preserving history, generating recap material, and surfacing snapshot-driven insights instead of decorative-only analytics.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:w-[420px] xl:grid-cols-1">
              <MiniKpi label="Estimated Listening Time" value={data.totalListeningHours} />
              <MiniKpi label="Listening Score" value={`${score}/10`} />
              <MiniKpi label="Current Range" value={RANGES.find((r) => r.key === activeRange)?.label || "Last 7 Days"} />
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
          <div className="xl:col-span-12">
            <SectionTitle title="Insights" />
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {data.latestInsights.length ? (
                data.latestInsights.map((insight) => (
                  <article key={insight.id} className="panel-soft rounded-[1.5rem] p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-lime-200">{insight.insightType}</p>
                    <h3 className="mt-3 text-xl font-semibold text-white">{insight.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/58">{insight.body}</p>
                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/40">Confidence {Math.round(insight.confidenceScore * 100)}%</p>
                  </article>
                ))
              ) : (
                <article className="panel-soft rounded-[1.5rem] p-5 text-sm text-white/60">
                  Snapshot-driven insights will appear here after synced listening periods accumulate.
                </article>
              )}
            </div>
          </div>

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
              <SyncStatusCard
                status={syncState.lastSyncStatus}
                lastSuccessfulSyncLabel={formatSyncTime(syncState.lastSuccessfulSyncAt)}
                lastRunLabel={syncState.latestRun ? `${syncState.latestRun.status.toLowerCase()} · ${formatSyncTime(syncState.latestRun.startedAt)}` : "No runs yet"}
                wasFresh={syncState.wasFresh}
              />
              <div className="panel-soft rounded-[1.6rem] p-5">
                <p className="text-xs uppercase tracking-[0.32em] text-lime-200">Now Playing</p>
                {data.currentTrack ? (
                  <div className="mt-4">
                    <p className="text-2xl font-semibold text-white">{data.currentTrack.name}</p>
                    <p className="mt-2 text-sm leading-7 text-white/62">{data.currentTrack.artists.join(", ")}</p>
                    <p className="text-sm text-white/45">{data.currentTrack.album}</p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-white/60">No live now-playing item was persisted in the latest sync window.</p>
                )}
              </div>

              <div className="panel-soft rounded-[1.6rem] p-5">
                <div className="space-y-4">
                  {data.recentActivity.length ? (
                    data.recentActivity.map((item) => (
                      <div key={item.id} className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] p-4">
                        <p className="text-[0.7rem] uppercase tracking-[0.28em] text-white/38">{item.action}</p>
                        <p className="mt-2 font-semibold text-white">{item.title}</p>
                        <p className="text-sm text-white/56">{item.subtitle}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.22em] text-cyan-200">{item.time}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-white/55">No recent persisted activity was available yet.</p>
                  )}
                </div>
              </div>

              <div className="panel-soft rounded-[1.6rem] p-5">
                <p className="text-sm text-white/50">Scrobble-backed score</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-4xl font-semibold text-white">{score}/10</p>
                  <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-lime-200">Explainable heuristic</span>
                </div>
                <p className="mt-4 text-sm leading-7 text-white/58">This score is a light heuristic built from scrobble volume and artist diversity. It is intentionally not presented as a scientific metric.</p>
              </div>
            </div>
          </aside>
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
        {(artist.genres?.length ? artist.genres : ["Persisted", "Last.fm"]).slice(0, 2).map((genre) => (
          <span key={genre} className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/52">{genre}</span>
        ))}
      </div>
    </article>
  );
}
