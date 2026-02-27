import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  aggregateByWindow,
  getCurrentlyPlaying,
  getRecentlyPlayed,
  getTopArtists,
  getTopTracks,
  TimeRange,
  WindowKey,
} from "@/lib/spotify";

const RANGE_MAP: Record<string, TimeRange> = {
  "24h": "short_term",
  "7d": "short_term",
  "30d": "medium_term",
};

const RANGES: { key: WindowKey; label: string }[] = [
  { key: "24h", label: "24H" },
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ range?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) redirect("/");

  const sp = (await searchParams) || {};
  const selectedRange = ((sp.range || "7d").toLowerCase() as WindowKey);
  const activeRange: WindowKey = RANGES.some((r) => r.key === selectedRange) ? selectedRange : "7d";
  const mappedRange = RANGE_MAP[activeRange] || "short_term";

  const [tracks, artists, nowPlaying, recent] = await Promise.all([
    getTopTracks(session.accessToken, mappedRange, 8),
    getTopArtists(session.accessToken, mappedRange, 8),
    getCurrentlyPlaying(session.accessToken),
    getRecentlyPlayed(session.accessToken, 50),
  ]);

  const windows = aggregateByWindow(recent.items);
  const realWindow = windows[activeRange];

  return (
    <main className="min-h-screen bg-[#070611] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        {session.error === "RefreshAccessTokenError" && (
          <div className="mb-6 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            Session expired. Please
            <Link href="/api/auth/signin/spotify" className="mx-1 underline">
              sign in again
            </Link>
            to refresh your Spotify connection.
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-200">Spotics Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold">Your listening insights</h1>
          <p className="mt-2 text-white/70">
            Window buttons now use your real recently played activity for 24H, 7D, and 30D.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-green-400/30 bg-green-500/10 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-green-200">Now Playing</p>
          {nowPlaying?.track ? (
            <div className="mt-2">
              <p className="text-xl font-semibold">{nowPlaying.track.name}</p>
              <p className="text-sm text-white/75">
                {nowPlaying.track.artists.join(", ")} • {nowPlaying.track.album}
              </p>
              <p className="mt-1 text-xs text-green-200">
                {nowPlaying.isPlaying ? "Playing right now" : "Paused"}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-white/70">Nothing currently playing on Spotify right now.</p>
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
                  active
                    ? "bg-white text-black"
                    : "border border-white/20 text-white/80 hover:bg-white/10"
                }`}
              >
                {r.label}
              </Link>
            );
          })}
        </section>

        <p className="mb-6 text-xs text-white/60">
          Real window plays: <span className="font-semibold text-white">{realWindow.totalPlays}</span>
        </p>

        <div className="grid gap-6 lg:grid-cols-3">
          <Column
            title={`Window Top Tracks (${activeRange.toUpperCase()})`}
            items={realWindow.tracks.slice(0, 8).map((t) => `${t.name} — ${(t.artists || []).join(", ")} (${t.plays})`)}
          />
          <Column
            title={`Window Top Artists (${activeRange.toUpperCase()})`}
            items={realWindow.artists.slice(0, 8).map((a) => `${a.name} (${a.plays})`)}
          />
          <Column
            title={`Window Top Albums (${activeRange.toUpperCase()})`}
            items={realWindow.albums.slice(0, 8).map((a) => `${a.name} — ${(a.artists || []).join(", ")} (${a.plays})`)}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Column
            title={`Spotify Affinity Top Tracks (${activeRange.toUpperCase()})`}
            items={tracks.items.map((t) => `${t.name} — ${t.artists.map((a) => a.name).join(", ")}`)}
          />
          <Column
            title={`Spotify Affinity Top Artists (${activeRange.toUpperCase()})`}
            items={artists.items.map((a) => a.name)}
          />
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
          items.map((item, idx) => (
            <li key={item + idx} className="rounded-lg border border-white/10 p-2">
              <span className="mr-2 text-white/60">#{idx + 1}</span>
              {item}
            </li>
          ))
        ) : (
          <li className="rounded-lg border border-white/10 p-2 text-white/60">No data yet for this window.</li>
        )}
      </ol>
    </section>
  );
}
