import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LastFmSignIn from "@/components/lastfm-signin";

function getAuthErrorHint(error?: string) {
  switch (error) {
    case "lastfm":
      return "Last.fm sign-in failed. Use your public Last.fm username and verify LASTFM_API_KEY in Railway.";
    case "Configuration":
      return "Authentication configuration is incomplete. Check NEXTAUTH_URL, NEXTAUTH_SECRET, AUTH_TRUST_HOST, and LASTFM_API_KEY in Railway.";
    default:
      return "Authentication failed. Check Railway logs for the Last.fm sign-in attempt and try again.";
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const isAuthed = Boolean(session?.lastfmUsername);
  const sp = (await searchParams) || {};
  const authError = sp.error;

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 text-white sm:px-6 lg:px-10 lg:py-10">
      <div className="noise pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10rem] right-[-6rem] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_28%),linear-gradient(135deg,rgba(143,69,255,0.22),rgba(255,79,216,0.12)_42%,rgba(68,214,255,0.08)_100%)]" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-10 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/45">Design Spotics</p>
                <h1 className="display-font mt-3 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">Welcome to Spotics</h1>
              </div>
              <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-lime-200 sm:block">
                Last.fm intelligence
              </div>
            </div>

            <p className="max-w-2xl text-base leading-8 text-white/72 sm:text-lg">
              Track your music listening habits, discover standout patterns, and turn your Last.fm history into a polished wrapped-style dashboard.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <FeaturePill label="Wrapped-ready" value="Year stories" />
              <FeaturePill label="Source" value="Last.fm only" />
              <FeaturePill label="Deployable" value="Railway-friendly" />
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="panel-soft rounded-[1.75rem] p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-fuchsia-200/85">Live snapshot</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Your music, visualized</h2>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">Dark editorial UI</div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <StatCard label="Tracks Played" value="2,847" delta="Scrobbles" />
                  <StatCard label="Unique Artists" value="312" delta="Catalog depth" />
                  <StatCard label="Listening Time" value="187h 42m" delta="Estimated" />
                  <StatCard label="Avg. Daily Mins" value="156" delta="Habit view" />
                </div>
              </div>

              <div className="panel-soft rounded-[1.75rem] p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/85">Preview card</p>
                <div className="mt-5 rounded-[1.5rem] border border-white/12 bg-black/25 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.7rem] uppercase tracking-[0.32em] text-lime-200">Your Wrapped 2026</p>
                      <h3 className="mt-3 text-2xl font-semibold text-white">Your Year in Music</h3>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-400" />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/65">
                    Sign in with Last.fm to generate the full dashboard, recent activity view, and analytics page without extra infrastructure.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/40">
                    <span className="h-2 w-2 rounded-full bg-lime-300" />
                    Lean v1 stack
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-10 text-sm text-white/42">Last.fm is the only source in v1, which keeps deployment simpler and the insights stable.</div>
          </div>
        </section>

        <section className="panel relative rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/45">Sign in</p>
                <h2 className="display-font mt-2 text-3xl font-bold text-white">Continue with Last.fm</h2>
              </div>
              {isAuthed ? (
                <span className="rounded-full border border-lime-300/25 bg-lime-300/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-lime-200">
                  Connected
                </span>
              ) : null}
            </div>

            {authError ? (
              <div className="mb-6 rounded-[1.5rem] border border-red-400/20 bg-red-500/10 p-4 text-sm leading-7 text-red-100/90">
                {getAuthErrorHint(authError)}
              </div>
            ) : null}

            {isAuthed ? (
              <div className="space-y-4">
                <Link
                  href="/dashboard"
                  className="flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-6 text-sm font-semibold text-black transition hover:scale-[1.01]"
                >
                  Open Dashboard
                </Link>
                <Link
                  href="/api/auth/signout"
                  className="flex h-14 items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-6 text-sm font-semibold text-white/80 transition hover:bg-white/8"
                >
                  Sign out
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <LastFmSignIn />
                </div>

                <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-black/15 p-5">
                  <p className="text-[0.7rem] uppercase tracking-[0.32em] text-white/45">Quick note</p>
                  <p className="mt-3 text-sm leading-7 text-white/62">
                    By continuing, you agree to Spotics&apos; Terms of Service and Privacy Policy. Railway deployment for v1 only needs Last.fm and auth variables configured correctly.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function FeaturePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel-soft rounded-[1.4rem] p-4">
      <p className="text-[0.65rem] uppercase tracking-[0.28em] text-white/40">{label}</p>
      <p className="mt-3 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function StatCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <article className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-4">
      <p className="text-sm text-white/52">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold text-white">{value}</p>
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-lime-200">{delta}</span>
      </div>
    </article>
  );
}
