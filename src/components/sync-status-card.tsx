type SyncStatusCardProps = {
  status: string;
  lastSuccessfulSyncLabel: string;
  lastRunLabel: string;
  wasFresh: boolean;
};

export default function SyncStatusCard({
  status,
  lastSuccessfulSyncLabel,
  lastRunLabel,
  wasFresh,
}: SyncStatusCardProps) {
  const badgeTone =
    status === "SUCCESS"
      ? "border-lime-300/20 bg-lime-300/10 text-lime-200"
      : status === "FAILED"
        ? "border-red-300/20 bg-red-300/10 text-red-100"
        : "border-white/10 bg-white/5 text-white/70";

  return (
    <div className="panel-soft rounded-[1.5rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/40">Sync status</p>
          <p className="mt-2 text-2xl font-semibold text-white">{status}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.22em] ${badgeTone}`}>
          {wasFresh ? "Cache fresh" : "Sync checked"}
        </span>
      </div>

      <div className="mt-5 space-y-3 text-sm text-white/60">
        <div className="flex items-center justify-between gap-4">
          <span>Last successful sync</span>
          <span className="text-white/82">{lastSuccessfulSyncLabel}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Latest sync run</span>
          <span className="text-white/82">{lastRunLabel}</span>
        </div>
      </div>

      <form action="/api/sync/lastfm" method="post" className="mt-5">
        <button
          type="submit"
          className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/8"
        >
          Trigger sync now
        </button>
      </form>
    </div>
  );
}
