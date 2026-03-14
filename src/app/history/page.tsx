import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ensureFreshSync, formatSyncTime } from "@/lib/sync-status";
import { ensureMonthlyRecap, getRecapArchive, getSnapshotHistory } from "@/lib/recaps";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.lastfmUsername) redirect("/");

  const syncState = await ensureFreshSync(session.lastfmUsername, 15 * 60 * 1000);
  const recap = await ensureMonthlyRecap(syncState.profileId, syncState.displayName);
  const archive = await getRecapArchive(syncState.profileId);
  const history = await getSnapshotHistory(syncState.profileId);

  return (
    <main className="min-h-screen px-4 py-6 text-white sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1400px]">
        <TopNav />
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/40">Spotics</p>
            <h1 className="display-font mt-3 text-4xl font-bold text-white sm:text-5xl">History & Recaps</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
              This is the archive layer: previous period snapshots, monthly recap records, and the start of a revisitable listening timeline.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:bg-white/8">
              Back to dashboard
            </Link>
            <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-lime-200">
              Last sync {formatSyncTime(syncState.lastSuccessfulSyncAt)}
            </span>
          </div>
        </header>

        <section className="panel rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-lime-200">Current monthly recap</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{recap.title}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries((recap.payloadJson || {}) as Record<string, string | number | null>).map(([key, value]) => (
              <article key={key} className="panel-soft rounded-[1.5rem] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-white/40">{key}</p>
                <p className="mt-3 text-xl font-semibold text-white">{String(value ?? "—")}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-8 xl:grid-cols-2">
          <article>
            <div className="mb-6 flex items-center gap-3">
              <div className="h-1 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
              <h2 className="text-2xl font-bold text-white">Recap archive</h2>
            </div>
            <div className="space-y-4">
              {archive.map((item) => (
                <div key={item.id} className="panel-soft rounded-[1.5rem] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-lime-200">{item.recapType}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/58">Created {formatSyncTime(item.createdAt)}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/40">Slug: {item.slug}</p>
                </div>
              ))}
            </div>
          </article>

          <article>
            <div className="mb-6 flex items-center gap-3">
              <div className="h-1 w-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
              <h2 className="text-2xl font-bold text-white">Snapshot history</h2>
            </div>
            <div className="space-y-4">
              {history.map((snapshot) => (
                <div key={snapshot.id} className="panel-soft rounded-[1.5rem] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-lime-200">{snapshot.periodType}</p>
                      <p className="mt-2 text-xl font-semibold text-white">{snapshot.totalScrobbles.toLocaleString()} scrobbles</p>
                    </div>
                    <p className="text-sm text-white/50">{snapshot.periodStart.toISOString().slice(0, 10)} → {snapshot.periodEnd.toISOString().slice(0, 10)}</p>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Metric label="Artists" value={snapshot.uniqueArtists} />
                    <Metric label="Tracks" value={snapshot.uniqueTracks} />
                    <Metric label="Albums" value={snapshot.uniqueAlbums} />
                    <Metric label="Minutes" value={snapshot.estimatedMinutes} />
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.2rem] border border-white/8 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value.toLocaleString()}</p>
    </div>
  );
}
}</p>
    </div>
  );
}
