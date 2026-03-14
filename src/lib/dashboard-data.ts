import { db } from "@/lib/db";
import { ensureUserAndProfile } from "@/lib/identity";

export type DashboardRange = "7d" | "30d" | "all";

function windowStart(range: DashboardRange) {
  const now = new Date();
  if (range === "all") return new Date(0);
  const days = range === "7d" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export async function getPersistedDashboardData(lastfmUsername: string, range: DashboardRange) {
  const profile = await ensureUserAndProfile(lastfmUsername);
  const since = windowStart(range);

  const scrobbles = await db.scrobble.findMany({
    where: {
      connectedProfileId: profile.id,
      scrobbledAt: { gte: since },
    },
    orderBy: { scrobbledAt: "desc" },
    include: {
      artist: true,
      album: true,
      track: true,
    },
    take: range === "all" ? 500 : 300,
  });

  const totalPlays = scrobbles.length;
  const uniqueArtists = new Set(scrobbles.map((item) => item.artistNameRaw)).size;
  const uniqueTracks = new Set(scrobbles.map((item) => item.trackNameRaw + "::" + item.artistNameRaw)).size;
  const totalMinutes = Math.round(totalPlays * 3.5);

  const trackMap = new Map<string, { id: string; title: string; subtitle: string; plays: number }>();
  const albumMap = new Map<string, { id: string; title: string; subtitle: string; plays: number }>();
  const artistMap = new Map<string, { id: string; name: string; plays: number }>();

  for (const item of scrobbles) {
    const trackKey = `${item.trackNameRaw}::${item.artistNameRaw}`;
    const albumKey = `${item.albumNameRaw || "Unknown Album"}::${item.artistNameRaw}`;
    const artistKey = item.artistNameRaw;

    trackMap.set(trackKey, {
      id: trackKey,
      title: item.trackNameRaw,
      subtitle: item.artistNameRaw,
      plays: (trackMap.get(trackKey)?.plays || 0) + 1,
    });

    albumMap.set(albumKey, {
      id: albumKey,
      title: item.albumNameRaw || "Unknown Album",
      subtitle: item.artistNameRaw,
      plays: (albumMap.get(albumKey)?.plays || 0) + 1,
    });

    artistMap.set(artistKey, {
      id: artistKey,
      name: artistKey,
      plays: (artistMap.get(artistKey)?.plays || 0) + 1,
    });
  }

  const recentActivity = scrobbles.slice(0, 5).map((item, index) => ({
    id: item.id,
    action: index === 0 && item.nowPlaying ? "Now playing" : "Listened to",
    title: item.trackNameRaw,
    subtitle: item.artistNameRaw,
    time: item.nowPlaying ? "Live now" : formatAgo(item.scrobbledAt),
  }));

  const topTracks = Array.from(trackMap.values()).sort((a, b) => b.plays - a.plays).slice(0, 5);
  const topAlbums = Array.from(albumMap.values()).sort((a, b) => b.plays - a.plays).slice(0, 5);
  const topArtists = Array.from(artistMap.values()).sort((a, b) => b.plays - a.plays).slice(0, 6);

  const byDay = new Array(7).fill(0);
  for (const item of scrobbles) {
    const d = item.scrobbledAt.getDay();
    const mondayIndex = (d + 6) % 7;
    byDay[mondayIndex] += 1;
  }
  const maxDay = Math.max(...byDay, 1);
  const weeklyBars = byDay.map((value) => Math.max(12, Math.round((value / maxDay) * 100)));
  const peakDay = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][byDay.indexOf(maxDay)] || "Mon";

  return {
    profile,
    totalPlays,
    uniqueArtists,
    uniqueTracks,
    totalMinutes,
    avgDailyMinutes: range === "all" ? Math.round(totalMinutes / 365) : Math.round(totalMinutes / (range === "7d" ? 7 : 30)),
    topTracks,
    topAlbums,
    topArtists,
    recentActivity,
    weeklyBars,
    peakDay,
    totalListeningHours: `${Math.floor(totalMinutes / 60)}h ${Math.round(totalMinutes % 60)}m`,
    comparison,
    latestInsights,
    currentTrack: scrobbles.find((item) => item.nowPlaying)
      ? {
          name: scrobbles.find((item) => item.nowPlaying)?.trackNameRaw || "Unknown Track",
          artists: [scrobbles.find((item) => item.nowPlaying)?.artistNameRaw || "Unknown Artist"],
          album: scrobbles.find((item) => item.nowPlaying)?.albumNameRaw || "Unknown Album",
        }
      : null,
  };
}

function formatAgo(date: Date) {
  const diffMinutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}
 Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}
