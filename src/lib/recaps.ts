import { db } from "@/lib/db";
import { buildPeriodSnapshot } from "@/lib/snapshots";

function monthBounds(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));
  return { year, month: month + 1, start, end };
}

function monthSlug(year: number, month: number) {
  return `monthly-${year}-${String(month).padStart(2, "0")}`;
}

export async function ensureMonthlyRecap(connectedProfileId: string, displayName: string) {
  const { year, month } = monthBounds();
  const slug = monthSlug(year, month);

  const existing = await db.recap.findUnique({ where: { slug } });
  if (existing) return existing;

  const snapshot = await buildPeriodSnapshot(connectedProfileId, "30d");
  const summary = snapshot.summaryJson as Record<string, string | null> | null;

  return db.recap.create({
    data: {
      connectedProfileId,
      recapType: "monthly",
      yearNum: year,
      monthNum: month,
      title: `${displayName} · ${year}-${String(month).padStart(2, "0")} recap`,
      slug,
      payloadJson: {
        totalScrobbles: snapshot.totalScrobbles,
        uniqueArtists: snapshot.uniqueArtists,
        uniqueTracks: snapshot.uniqueTracks,
        estimatedMinutes: snapshot.estimatedMinutes,
        topArtist: summary?.topArtist || null,
        topTrack: summary?.topTrack || null,
        topAlbum: summary?.topAlbum || null,
      },
    },
  });
}

export async function getRecapArchive(connectedProfileId: string) {
  return db.recap.findMany({
    where: { connectedProfileId },
    orderBy: [{ yearNum: "desc" }, { monthNum: "desc" }, { createdAt: "desc" }],
    take: 12,
  });
}

export async function getSnapshotHistory(connectedProfileId: string) {
  return db.periodSnapshot.findMany({
    where: { connectedProfileId },
    orderBy: { periodEnd: "desc" },
    take: 16,
  });
}
