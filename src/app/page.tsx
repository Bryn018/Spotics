import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { aggregateByWindow, getRecentlyPlayed, getTopTracks } from "@/lib/spotify";

function getAuthErrorHint(error?: string) {
  switch (error) {
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthCreateAccount":
    case "OAuthAccountNotLinked":
    case "Callback":
    case "spotify":
      return {
        summary: "Spotify OAuth failed.",
        checks: [
          "Verify SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in Railway.",
          "Confirm redirect URI exactly matches /api/auth/callback/spotify in Spotify dashboard.",
          "Ensure your Spotify account is allowed as a test user (if app is restricted).",
        ],
      };
    case "Configuration":
      return {
        summary: "Auth configuration issue.",
        checks: [
          "Verify NEXTAUTH_URL equals your deployed Railway URL.",
          "Set NEXTAUTH_SECRET to a long random value.",
          "Set AUTH_TRUST_HOST=true and redeploy.",
        ],
      };
    case "AccessDenied":
      return {
        summary: "Access denied by provider.",
        checks: [
          "Check Spotify app mode and user access.",
          "Confirm you are logging in with an allowed Spotify account.",
        ],
      };
    default:
      return {
        summary: "Authentication failed.",
        checks: ["Check Railway logs for [next-auth][error] around login time."],
      };
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const isAuthed = Boolean(session?.accessToken);
  const sp = (await searchParams) || {};
  const authError = sp.error;
  const authHint = getAuthErrorHint(authError);

  let snapshot: {
    mode: "window" | "top";
    totalPlays?: number;
    uniqueArtists?: number;
    topTracks: string[];
  } | null = null;

  if (session?.accessToken) {
    try {
      const recent = await getRecentlyPlayed(session.accessToken, 50);
      const windows = aggregateByWindow(recent.items);
      const w = windows["7d"];

      snapshot = {
        mode: "window",
        totalPlays: w.totalPlays,
        uniqueArtists: w.artists.length,
        topTracks: w.tracks.slice(0, 3).map((t) => `${t.name} — ${(t.artists || []).join(", ")} (${t.plays})`),
      };
    } catch {
      try {
        const top = await getTopTracks(session.accessToken, "short_term", 3);
        snapshot = {
          mode: "top",
          topTracks: top.items.map((t) => `${t.name} — ${t.artists.map((a) => a.name).join(", ")}`),
        };
      } catch {
        snapshot = null;
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#070611] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-r from-fuchsia-600/30 via-violet-500/20 to-cyan-400/30 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-200">Spotics</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Your Spotify listening intelligence</h1>
          <p className="mt-4 max-w-2xl text-white/80">
            Spotics now supports fallback mode, but some insights require eligible Spotify account features.
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

        {authError && (
          <div className="mb-6 rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100">
            <p className="font-semibold">Login failed</p>
            <p className="mt-1 text-red-100/90">{authHint.summary}</p>
            <p className="mt-2 text-xs text-red-200/90">
              Error code: <span className="rounded bg-black/30 px-1 py-0.5 font-mono">{authError}</span>
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-red-100/90">
              {authHint.checks.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
            <p className="mt-2 text-red-100/80">
              After updating vars/settings, redeploy then try
              <Link href="/api/auth/signin/spotify" className="mx-1 underline">
                sign in again
              </Link>
              .
            </p>
          </div>
        )}

        {snapshot ? (
          snapshot.mode === "window" ? (
            <section className="grid gap-5 md:grid-cols-3">
              <StatsCard title="Recent Plays" value={String(snapshot.totalPlays ?? 0)} hint="last 7 days" color="from-cyan-400/40" />
              <StatsCard
                title="Unique Artists"
                value={String(snapshot.uniqueArtists ?? 0)}
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
            <section className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/80">
              <p className="mb-2 font-semibold text-white">Fallback mode active</p>
              <p className="mb-3 text-sm text-white/70">Recent-play windows are unavailable, so we’re showing top tracks instead.</p>
              <ul className="space-y-2 text-sm">
                {snapshot.topTracks.map((track) => (
                  <li key={track} className="rounded-lg border border-white/10 p-2">
                    {track}
                  </li>
                ))}
              </ul>
            </section>
          )
        ) : (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/75">
            {isAuthed
              ? "Couldn’t load snapshot data right now. Open dashboard to retry."
              : "Sign in with Spotify to see your listening snapshot."}
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
