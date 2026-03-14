import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LastFmSignIn from "@/components/lastfm-signin";

function getAuthErrorHint(error?: string) {
  switch (error) {
    case "lastfm":
      return "We could not validate that Last.fm profile. Check the username and confirm your LASTFM_API_KEY is configured correctly.";
    case "Configuration":
      return "Authentication configuration is incomplete. Check NEXTAUTH_URL, NEXTAUTH_SECRET, AUTH_TRUST_HOST, DATABASE_URL, and LASTFM_API_KEY.";
    default:
      return "Authentication failed. Check your server logs, verify environment variables, and try again.";
  }
}

const foundationHighlights = [
  {
    label: "Persistent foundation",
    value: "Database-ready",
    description: "Spotics is being rebuilt around persisted listening history, not one-shot page fetches.",
  },
  {
    label: "Source of truth",
    value: "Last.fm-first",
    description: "The product is intentionally focused on Last.fm so the data model and insights stay coherent.",
  },
  {
    label: "Product direction",
    value: "Music intelligence",
    description: "The goal is long-term listening insight, trends, recaps, and history — not decorative fake analytics.",
  },
] as const;

const productionPillars = [
  "Tracked listening history",
  "Honest analytics",
  "Historical comparisons",
  "Recaps and milestones",
] as const;

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

      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_28%),linear-gradient(135deg,rgba(143,69,255,0.22),rgba(255,79,216,0.12)_42%,rgba(68,214,255,0.08)_100%)]" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-10 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/45">Spotics</p>
                <h1 className="display-font mt-3 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">Last.fm music intelligence</h1>
              </div>
              <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-lime-200 sm:block">
                Production rebuild
              </div>
            </div>

            <p className="max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
              Spotics is being rebuilt into a production-minded platform for tracking, storing, and explaining listening behaviour from Last.fm. The focus is long-term insight, honest metrics, and a durable data foundation.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {foundationHighlights.map((item) => (
                <FeaturePill key={item.label} label={item.label} value={item.value} description={item.description} />
              ))}
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="panel-soft rounded-[1.75rem] p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-fuchsia-200/85">What this rebuild changes</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">From demo dashboard to real product base</h2>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">Phase 1</div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <StatCard label="Data model" value="Prisma + Postgres" delta="Scaffolding" />
                  <StatCard label="Runtime safety" value="Validated env" delta="Hard requirement" />
                  <StatCard label="Architecture" value="Sync-ready" delta="Foundation" />
                  <StatCard label="Analytics stance" value="Honest > decorative" delta="Principle" />
                </div>
              </div>

              <div className="panel-soft rounded-[1.75rem] p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/85">Product pillars</p>
                <div className="mt-5 rounded-[1.5rem] border border-white/12 bg-black/25 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.7rem] uppercase tracking-[0.32em] text-lime-200">Production intent</p>
                      <h3 className="mt-3 text-2xl font-semibold text-white">Built for history, trends, and recaps</h3>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-400" />
                  </div>
                  <div className="mt-4 space-y-2 text-sm leading-7 text-white/65">
                    {productionPillars.map((pillar) => (
                      <div key={pillar} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-lime-300" />
                        <span>{pillar}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-7 text-white/58">
                    Last.fm remains the first-class source, but the architecture is now being shaped for persistent scrobbles, rollups, insights, and shareable recaps.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-10 text-sm text-white/42">
              This branch is intentionally focused on production foundations first: stronger data modeling, safer runtime configuration, and clearer product truth.
            </div>
          </div>
        </section>

        <section className="panel relative rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/45">Connect profile</p>
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
                  <p className="text-[0.7rem] uppercase tracking-[0.32em] text-white/45">What this connection means</p>
                  <p className="mt-3 text-sm leading-7 text-white/62">
                    For now, Spotics validates the public Last.fm profile and uses it to power your dashboard session. Later rebuild phases will introduce persisted accounts, sync history, and richer profile controls.
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

function FeaturePill({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="panel-soft rounded-[1.4rem] p-4">
      <p className="text-[0.65rem] uppercase tracking-[0.28em] text-white/40">{label}</p>
      <p className="mt-3 text-lg font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/55">{description}</p>
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
