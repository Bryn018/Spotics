import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { aggregateByWindow, getRecentlyPlayed } from "@/lib/spotify";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isAuthed = Boolean(session?.accessToken);

  let snapshot: {
    totalPlays: number;
    uniqueArtists: number;
    topTracks: string[];
  } | null = null;

  if (session?.accessToken) {
    try {
      const recent = await getRecentlyPlayed(session.accessToken, 50);
      const windows = aggregateByWindow(recent.items);
      const w = windows["7d"];

      snapshot = {
        totalPlays: w.totalPlays,
        uniqueArtists: w.artists.length,
        topTracks: w.tracks.slice(0, 3).map((t) => `${t.name} — ${(t.artists || []).join(", ")} (${t.plays})`),
      };
    } catch {
      snapshot = null;
    }
  }

  return (
    <main className="min-h-screen bg-[#070611] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-r from-fuchsia-600/30 via-violet-500/20 to-cyan-400/30 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-200">Spotics</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Your Spotify listening intelligence</h1>
          <p className="mt-4 max-w-2xl text-white/80">
            Track your music taste with real 24H, 7D, and 30D activity windows plus Spotify affinity insights.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {isAuthed ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-white/90"
                >
                  Open Dashboard
                </Link>
                <Link
                  href="/api/auth/signout"
                  className="rounded-xl border border-white/20 px-5 py-3 font-semibold hover:bg-white/10"
                >
                  Sign out
                </Link>
              </>
            ) : (
              <Link
                href="/api/auth/signin/spotify"
                className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-black transition hover:bg-green-400"
              >
                Continue with Spotify
              </Link>
            )}
          </div>
        </header>

        {session?.error === "RefreshAccessTokenError" && (
          <div className="mb-6 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            Your Spotify session expired. Please
            <Link href="/api/auth/signin/spotify" className="mx-1 underline">
              sign in again
            </Link>
            to continue.
          </div>
        )}

        {snapshot ? (
          <section className="grid gap-5 md:grid-cols-3">
            <StatsCard title="Recent Plays" value={String(snapshot.totalPlays)} hint="last 7 days" color="from-cyan-400/40" />
            <StatsCard
              title="Unique Artists"
              value={String(snapshot.uniqueArtists)}
              hint="last 7 days"
              color="from-fuchsia-400/40"
            />
            <StatsCard
              title="Top Song"
              value={snapshot.topTracks[0]?.split(" — ")[0] || "-"}
              hint="last 7 days"
              color="from-emerald-400/40"
            />
          </section>
        ) : (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/75">
            {isAuthed
              ? "Couldn’t load your snapshot right now. Open the dashboard to retry."
              : "Sign in with Spotify to see your live listening snapshot."}
          </section>
        )}
      </div>
    </main>
  );
}

function StatsCard({ title, value, hint, color }: { title: string; value: string; hint: string; color: string }) {
  return (
    <article className={`rounded-2xl border border-white/10 bg-gradient-to-br ${color} to-transparent p-5`}>
      <p className="text-sm text-white/70">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm text-white/70">{hint}</p>
    </article>
  );
}
