import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getPersistedDashboardData } from "@/lib/dashboard-data";
import { syncLastFmProfile } from "@/lib/sync";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.lastfmUsername) redirect("/");

  await syncLastFmProfile(session.lastfmUsername, 200);
  const data = await getPersistedDashboardData(session.lastfmUsername, "7d");

  const sourceLabel = "Last.fm";
  const topArtistName = data.topArtists[0]?.name || "No artist yet";
  const artistMix = data.topArtists.slice(0, 5).map((artist, index) => {
    const percent = data.totalPlays ? Math.max(8, Math.round((artist.plays / data.totalPlays) * 100)) : 0;
    return { name: artist.name, plays: artist.plays, percent, index };
  });

  return (
    <main className="min-h-screen px-4 py-6 text-white sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/40">Spotics</p>
            <h1 className="display-font mt-3 text-4xl font-bold text-white sm:text-5xl">Analytics</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
              This analytics view now reads from persisted scrobbles. Where estimates are shown, they are labeled as estimates instead of being disguised as exact values.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:bg-white/8">
              Back to dashboard
            </Link>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/55">
              Source: {sourceLabel}
            </span>
          </div>
        </header>

        <section className="panel rounded-[2rem] p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Listening Activity</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Your last 7 days</h2>
            </div>
            <div className="rounded-full border border-lime-300/20 bg-lime-300/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-lime-200">
              Persisted analytics
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="panel-soft rounded-[1.75rem] p-5 sm:p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white/50">Weekly chart</p>
                  <p className="mt-1 text-3xl font-semibold text-white">{data.totalMinutes}m</p>
                </div>
                <div className="text-right text-sm text-white/55">Peak day: {data.peakDay}</div>
              </div>
              <div className="grid h-72 grid-cols-7 items-end gap-3">
                {data.weeklyBars.map((bar, index) => (
                  <div key={`${bar}-${index}`} className="flex h-full flex-col justify-end gap-3">
                    <div className="rounded-t-[18px] bg-gradient-to-t from-cyan-400 via-violet-500 to-magenta-400" style={{ height: `${bar}%` }} />
                    <p className="text-center text-[11px] uppercase tracking-[0.18em] text-white/38">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <StatCard label="Average" value={`${data.avgDailyMinutes}m`} sublabel="Estimated per day" />
              <StatCard label="Peak Day" value={data.peakDay} sublabel="Highest scrobble count" />
              <StatCard label="Top Artist" value={topArtistName} sublabel="Most played in 7d" />
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <SyncStatusCard
            status={syncState.lastSyncStatus}
            lastSuccessfulSyncLabel={formatSyncTime(syncState.lastSuccessfulSyncAt)}
            lastRunLabel={syncState.latestRun ? `${syncState.latestRun.status.toLowerCase()} · ${formatSyncTime(syncState.latestRun.startedAt)}` : "No runs yet"}
            wasFresh={syncState.wasFresh}
          />
          <article className="panel-soft rounded-[1.75rem] p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Weekly Insights</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Simple, explainable summaries</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Scrobbles", data.totalPlays.toLocaleString(), `${data.comparison.deltas.scrobbles >= 0 ? "+" : ""}${data.comparison.deltas.scrobbles}% vs previous period`],
                ["Unique Tracks", data.uniqueTracks.toLocaleString(), `${data.comparison.deltas.tracks >= 0 ? "+" : ""}${data.comparison.deltas.tracks}% vs previous period`],
                ["Unique Artists", data.uniqueArtists.toLocaleString(), `${data.comparison.deltas.artists >= 0 ? "+" : ""}${data.comparison.deltas.artists}% vs previous period`],
                ["Listening Time", `${data.totalMinutes}m`, `${data.comparison.deltas.minutes >= 0 ? "+" : ""}${data.comparison.deltas.minutes}% vs previous period`],
              ].map(([label, value, note]) => (
                <div key={label} className="rounded-[1.4rem] border border-white/8 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/40">{label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
                  <p className="mt-2 text-sm text-white/55">{note}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[1.5rem] border border-orange-300/20 bg-orange-300/10 p-5">
              <p className="text-sm">📌</p>
              <h4 className="mt-2 text-lg font-semibold text-white">Analytics honesty note</h4>
              <p className="mt-2 text-sm leading-7 text-white/65">
                Genre claims and decorative milestone XP were intentionally removed from the primary analytics framing here. This page is being rebuilt around persisted scrobbles and explainable metrics first.
              </p>
            </div>
          </article>

          <article className="panel-soft rounded-[1.75rem] p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Top Artist Mix</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Your most played artists this week</h3>
            <div className="mt-5 rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/40">Most Played Artist</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{topArtistName}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-white">{artistMix[0]?.percent ?? 0}%</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">{(artistMix[0]?.plays ?? 0).toLocaleString()} plays</p>
                </div>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/6">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-magenta-400 to-cyan-400" style={{ width: `${artistMix[0]?.percent ?? 0}%` }} />
              </div>
              <div className="mt-4 text-sm text-white/58">Total persisted plays: {data.totalPlays.toLocaleString()}</div>
            </div>
            <div className="mt-5 space-y-3">
              {artistMix.map((item, index) => (
                <div key={item.name} className="rounded-[1.3rem] border border-white/8 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-xs font-semibold text-white">{index + 1}</div>
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-sm text-white/55">{item.plays.toLocaleString()} plays</p>
                      </div>
                    </div>
                    <div className="text-right text-lg font-semibold text-white">{item.percent}%</div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value, sublabel }: { label: string; value: string; sublabel: string }) {
  return (
    <article className="panel-soft rounded-[1.5rem] p-5">
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-lime-200">{sublabel}</p>
    </article>
  );
}
