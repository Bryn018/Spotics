import { db } from "@/lib/db";
import { ensureUserAndProfile } from "@/lib/identity";
import { syncLastFmProfile } from "@/lib/sync";

const DEFAULT_SYNC_INTERVAL_MS = 15 * 60 * 1000;

export async function ensureFreshSync(lastfmUsername: string, maxAgeMs = DEFAULT_SYNC_INTERVAL_MS) {
  const profile = await ensureUserAndProfile(lastfmUsername);
  const now = Date.now();
  const lastSyncAt = profile.lastSuccessfulSyncAt?.getTime() ?? 0;
  const isFresh = lastSyncAt > 0 && now - lastSyncAt < maxAgeMs;

  if (!isFresh) {
    await syncLastFmProfile(lastfmUsername, 200);
  }

  const updated = await db.connectedProfile.findUnique({
    where: { id: profile.id },
  });

  const latestRun = await db.syncRun.findFirst({
    where: { connectedProfileId: profile.id },
    orderBy: { startedAt: "desc" },
  });

  return {
    profileId: profile.id,
    displayName: updated?.displayName || profile.displayName,
    lastSyncStatus: updated?.lastSyncStatus || profile.lastSyncStatus,
    lastSuccessfulSyncAt: updated?.lastSuccessfulSyncAt || profile.lastSuccessfulSyncAt,
    latestRun,
    wasFresh: isFresh,
  };
}

export function formatSyncTime(date?: Date | null) {
  if (!date) return "Never synced";
  const diffMinutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}
