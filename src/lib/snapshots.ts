import { db } from "@/lib/db";

export type SnapshotRange = "7d" | "30d" | "all";

function rangeWindow(range: SnapshotRange) {
  if (range === "all") {
    return {
      start: new Date(0),
      end: new Date(),
      periodType: "all-time",
      previousStart: new Date(0),
      previousEnd: new Date(0),
    };
  }

  const end = new Date();
  const days = range === "7d" ? 7 : 30;
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const previousEnd = new Date(start.getTime());
  const previousStart = new Date(previousEnd.getTime() - days * 24 * 60 * 60 * 1000);

  return {
    start,
    end,
    periodType: range === "7d" ? "week" : "month",
    previousStart,
    previousEnd,
  };
}

function toPercentDelta(current: number, previous: number) {
  if (!previous && !current) return 0;
  if (!previous) return 100;
  return Math.round(((current - previous) / previous) * 100);
}

export async function buildPeriodSnapshot(connectedProfileId: string, range: SnapshotRange) {
  const { start, end, periodType } = rangeWindow(range);

  const existing = await db.periodSnapshot.findFirst({
    where: {
      connectedProfileId,
      periodType,
      periodStart: start,
      periodEnd: end,
    },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;

  const scrobbles = await db.scrobble.findMany({
    where: {
      connectedProfileId,
      scrobbledAt: { gte: start, lte: end },
    },
    orderBy: { scrobbledAt: "desc" },
  });

  const totalScrobbles = scrobbles.length;
  const uniqueArtists = new Set(scrobbles.map((item) => item.artistNameRaw)).size;
  const uniqueTracks = new Set(scrobbles.map((item) => `${item.trackNameRaw}::${item.artistNameRaw}`)).size;
  const uniqueAlbums = new Set(scrobbles.map((item) => `${item.albumNameRaw || "Unknown Album"}::${item.artistNameRaw}`)).size;
  const estimatedMinutes = Math.round(totalScrobbles * 3.5);
  const repeatRatio = totalScrobbles ? Number(((totalScrobbles - uniqueTracks) / totalScrobbles).toFixed(2)) : 0;
  const discoveryRatio = totalScrobbles ? Number((uniqueArtists / totalScrobbles).toFixed(2)) : 0;

  const artistCounts = new Map<string, number>();
  const trackCounts = new Map<string, number>();
  const albumCounts = new Map<string, number>();

  for (const scrobble of scrobbles) {
    artistCounts.set(scrobble.artistNameRaw, (artistCounts.get(scrobble.artistNameRaw) || 0) + 1);
    trackCounts.set(`${scrobble.trackNameRaw}::${scrobble.artistNameRaw}`, (trackCounts.get(`${scrobble.trackNameRaw}::${scrobble.artistNameRaw}`) || 0) + 1);
    albumCounts.set(`${scrobble.albumNameRaw || "Unknown Album"}::${scrobble.artistNameRaw}`, (albumCounts.get(`${scrobble.albumNameRaw || "Unknown Album"}::${scrobble.artistNameRaw}`) || 0) + 1);
  }

  const topArtist = Array.from(artistCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const topTrack = Array.from(trackCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const topAlbum = Array.from(albumCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return db.periodSnapshot.create({
    data: {
      connectedProfileId,
      periodType,
      periodStart: start,
      periodEnd: end,
      totalScrobbles,
      uniqueArtists,
      uniqueTracks,
      uniqueAlbums,
      estimatedMinutes,
      discoveryRatio,
      repeatRatio,
      summaryJson: {
        range,
        topArtist,
        topTrack,
        topAlbum,
      },
    },
  });
}

export async function getSnapshotComparison(connectedProfileId: string, range: SnapshotRange) {
  const { previousStart, previousEnd } = rangeWindow(range);
  const snapshots = await db.periodSnapshot.findMany({
    where: { connectedProfileId },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const current = snapshots[0] || (await buildPeriodSnapshot(connectedProfileId, range));
  const previous = snapshots.find((snapshot) => snapshot.periodStart >= previousStart && snapshot.periodEnd <= previousEnd);

  return {
    current,
    previous,
    deltas: {
      scrobbles: toPercentDelta(current.totalScrobbles, previous?.totalScrobbles || 0),
      artists: toPercentDelta(current.uniqueArtists, previous?.uniqueArtists || 0),
      tracks: toPercentDelta(current.uniqueTracks, previous?.uniqueTracks || 0),
      minutes: toPercentDelta(current.estimatedMinutes, previous?.estimatedMinutes || 0),
    },
  };
}

export async function generateInsights(connectedProfileId: string, range: SnapshotRange) {
  const comparison = await getSnapshotComparison(connectedProfileId, range);
  const candidateInsights: Array<{ title: string; body: string; insightType: string; confidenceScore: number }> = [];

  if (comparison.deltas.scrobbles > 15) {
    candidateInsights.push({
      title: "Listening volume is up",
      body: `Your scrobbles increased by ${comparison.deltas.scrobbles}% compared with the previous comparable period.`,
      insightType: "trend-up",
      confidenceScore: 0.82,
    });
  } else if (comparison.deltas.scrobbles < -15) {
    candidateInsights.push({
      title: "Listening volume cooled down",
      body: `Your scrobble volume dropped by ${Math.abs(comparison.deltas.scrobbles)}% compared with the previous comparable period.`,
      insightType: "trend-down",
      confidenceScore: 0.79,
    });
  }

  if (comparison.current.discoveryRatio > 0.45) {
    candidateInsights.push({
      title: "High discovery period",
      body: "This period shows a relatively high artist-diversity ratio, suggesting broader exploration than usual.",
      insightType: "discovery",
      confidenceScore: 0.74,
    });
  }

  if (comparison.current.repeatRatio > 0.45) {
    candidateInsights.push({
      title: "Heavy replay behaviour",
      body: "A large share of this period's scrobbles came from repeated track listens rather than one-off plays.",
      insightType: "loyalty",
      confidenceScore: 0.77,
    });
  }

  const created: typeof candidateInsights = [];
  for (const insight of candidateInsights) {
    const duplicate = await db.insightSnapshot.findFirst({
      where: {
        connectedProfileId,
        periodSnapshotId: comparison.current.id,
        insightType: insight.insightType,
        title: insight.title,
      },
    });
    if (duplicate) continue;

    await db.insightSnapshot.create({
      data: {
        connectedProfileId,
        periodSnapshotId: comparison.current.id,
        insightType: insight.insightType,
        title: insight.title,
        body: insight.body,
        confidenceScore: insight.confidenceScore,
      },
    });
    created.push(insight);
  }

  return created;
}
