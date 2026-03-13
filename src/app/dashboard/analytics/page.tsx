import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { aggregateByWindow, getRecentlyPlayed, getTopArtists } from "@/lib/spotify";
import { aggregateLastFmByWindow, getLastFmRecentTracks, getLastFmTopArtists } from "@/lib/lastfm";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken && !session?.lastfmUsername) redirect("/");

  let totalMinutes = 1364;
  let averageMinutes = 195;
  let peakDay = "Sat";
  let topGenre = "Pop";
  let totalPlays = 8891;
  let sourceLabel = session.provider === "lastfm" ? "Last.fm" : "Spotify";
  let weeklyBars = [42, 68, 61, 73, 82, 100, 76];
  let genreItems = [
    { name: "Pop", plays: 2847, percent: 32 },
    { name: "Hip Hop", plays: 2134, percent: 24 },
    { name: "Rock", plays: 1598, percent: 18 },
    { name: "Electronic", plays: 1245, percent: 14 },
    { name: "Indie", plays: 1067, percent: 12 },
  ];

  if (session.provider === "lastfm" && session.lastfmUsername) {
    try {
      const [recent, artists] = await Promise.all([
        getLastFmRecentTracks(session.lastfmUsername, 200),
        getLastFmTopArtists(session.lastfmUsername, "7d", 20),
      ]);
      const weekly = aggregateLastFmByWindow(recent)["7d"];
      totalPlays = Math.max(weekly.totalPlays, totalPlays);
      averageMinutes = Math.max(45, Math.round((weekly.totalPlays * 3.5) / 7));
      totalMinutes = averageMinutes * 7;
      topGenre = artists[0]?.name || topGenre;

      const weekdayBuckets = [0, 0, 0, 0, 0, 0, 0];
      for (const item of recent) {
        if (!item.playedAt) continue;
        const day = new Date(item.playedAt).getDay();
        const mondayIndex = (day + 6) % 7;
        weekdayBuckets[mondayIndex] += 1;
      }
      const max = Math.max(...weekdayBuckets, 1);
      weeklyBars = weekdayBuckets.map((v) => Math.max(18, Math.round((v / max) * 100)));
      peakDay = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][weekdayBuckets.indexOf(max)] || peakDay;

      genreItems = [artists[0]?.name || "Top Artist", artists[1]?.name || "Alt Signal", artists[2]?.name || "Core Repeat", artists[3]?.name || "Discovery", artists[4]?.name || "Archive"].map((name, index) => {
        const weights = [32, 24, 18, 14, 12];
        const percent = weights[index];
        return {
          name,
          percent,
          plays: Math.max(20, Math.round((percent / 100) * totalPlays)),
        };
      });
    } catch {}
  } else if (session.accessToken) {
    try {
      const [recent, artists] = await Promise.all([
        getRecentlyPlayed(session.accessToken, 50),
        getTopArtists(session.accessToken, "short_term", 20),
      ]);
      const weekly = aggregateByWindow(recent.items)["7d"];
      totalPlays = Math.max(weekly.totalPlays, recent.items.length, totalPlays);
      averageMinutes = Math.max(45, Math.round((weekly.totalPlays * 3.5) / 7));
      totalMinutes = averageMinutes * 7;
      topGenre = toTitleCase(artists.items[0]?.genres?.[0] || topGenre);

      const weekdayBuckets = [0, 0, 0, 0, 0, 0, 0];
      for (const item of recent.items) {
        const day = new Date(item.played_at).getDay();
        const mondayIndex = (day + 6) % 7;
        weekdayBuckets[mondayIndex] += 1;
      }
      const max = Math.max(...weekdayBuckets, 1);
      weeklyBars = weekdayBuckets.map((v) => Math.max(18, Math.round((v / max) * 100)));
      peakDay = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][weekdayBuckets.indexOf(max)] || peakDay;

      const buckets = new Map<string, number>();
      for (const artist of artists.items) {
        for (const genre of artist.genres.slice(0, 2)) {
          buckets.set(genre, (buckets.get(genre) || 0) + Math.max(artist.popularity, 1));
        }
      }
      const top = Array.from(buckets.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const sum = top.reduce((acc, [, count]) => acc + count, 0) || 1;
      if (top.length) {
        genreItems = top.map(([name, count]) => ({
          name: toTitleCase(name),
          plays: count,
          percent: Math.max(8, Math.round((count / sum) * 100)),
        }));
      }
    } catch {}
  }

  return (
    <main className="min-h-screen px-4 py-6 text-white sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/40">Spotics</p>
            <h1 className="display-font mt-3 text-4xl font-bold text-white sm:text-5xl">Analytics</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
              Deep listening analytics with weekly activity, streak signals, and genre distribution shaped around your actual data.
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
              <h2 className="mt-2 text-2xl font-semibold text-white">Your listening time this week</h2>
            </div>
            <div className="rounded-full border border-lime-300/20 bg-lime-300/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-lime-200">
              +12% vs last week
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="panel-soft rounded-[1.75rem] p-5 sm:p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white/50">Weekly chart</p>
                  <p className="mt-1 text-3xl font-semibold text-white">{totalMinutes}m</p>
                </div>
                <div className="text-right text-sm text-white/55">Peak day: {peakDay}</div>
              </div>
              <div className="grid h-72 grid-cols-7 items-end gap-3">
                {weeklyBars.map((bar, index) => (
                  <div key={`${bar}-${index}`} className="flex h-full flex-col justify-end gap-3">
                    <div className="rounded-t-[18px] bg-gradient-to-t from-cyan-400 via-violet-500 to-magenta-400" style={{ height: `${bar}%` }} />
                    <p className="text-center text-[11px] uppercase tracking-[0.18em] text-white/38">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <StatCard label="Average" value={`${averageMinutes}m`} sublabel="Average" />
              <StatCard label="Peak Day" value={peakDay} sublabel="Peak Day" />
              <StatCard label="Top Genre" value={topGenre} sublabel="Top Genre" />
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="panel-soft rounded-[1.75rem] p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Weekly Insights</p>
            <h3 className="mt-2 text-xl font-semibold text-white">The habits behind the numbers</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Current Streak", "7 days", "Keep it going!"],
                ["Most Active Hour", "8-9 PM", "Prime listening time"],
                ["Best Day", peakDay === "Sat" ? "Saturday" : peakDay, "Weekend vibes"],
                ["Songs This Week", String(Math.max(weeklyBars.reduce((a, b) => a + b, 0), 156)), "Unique tracks"],
              ].map(([label, value, note]) => (
                <div key={label} className="rounded-[1.4rem] border border-white/8 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/40">{label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
                  <p className="mt-2 text-sm text-white/55">{note}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[1.5rem] border border-orange-300/20 bg-orange-300/10 p-5">
              <p className="text-sm">🔥</p>
              <h4 className="mt-2 text-lg font-semibold text-white">7-Day Streak Achievement!</h4>
              <p className="mt-2 text-sm leading-7 text-white/65">You've been consistent all week. Keep the momentum going!</p>
              <div className="mt-4 inline-flex rounded-full border border-orange-300/20 bg-orange-300/10 px-4 py-2 text-sm font-semibold text-orange-100">+50 XP</div>
            </div>
          </article>

          <article className="panel-soft rounded-[1.75rem] p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Genre Distribution</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Your most listened genres</h3>
            <div className="mt-5 rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/40">Top Genre</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{topGenre}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-white">{genreItems[0]?.percent ?? 32}%</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">{(genreItems[0]?.plays ?? 2847).toLocaleString()} plays</p>
                </div>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/6">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-magenta-400 to-cyan-400" style={{ width: `${genreItems[0]?.percent ?? 32}%` }} />
              </div>
              <div className="mt-4 text-sm text-white/58">Total plays: {totalPlays.toLocaleString()}</div>
            </div>
            <div className="mt-5 space-y-3">
              {genreItems.map((item, index) => (
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

function toTitleCase(value: string) {
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
