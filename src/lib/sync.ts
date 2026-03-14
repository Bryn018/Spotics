import { db } from "@/lib/db";
import { ensureUserAndProfile } from "@/lib/identity";
import { aggregateLastFmByWindow, getLastFmRecentTracks } from "@/lib/lastfm";

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function scrobbleKey(track: { name: string; artist: string; album: string; playedAt?: number; nowPlaying?: boolean }) {
  return [slugify(track.name), slugify(track.artist), slugify(track.album || "unknown"), track.playedAt || "now", track.nowPlaying ? "live" : "scrobble"].join("::");
}

export async function syncLastFmProfile(lastfmUsername: string, limit = 200) {
  const profile = await ensureUserAndProfile(lastfmUsername);

  const syncRun = await db.syncRun.create({
    data: {
      connectedProfileId: profile.id,
      syncType: "MANUAL",
      status: "RUNNING",
      metadataJson: { source: "dashboard-load", requestedLimit: limit },
    },
  });

  try {
    const recent = await getLastFmRecentTracks(lastfmUsername, limit);
    let inserted = 0;
    let updated = 0;

    for (const item of recent) {
      const artistName = item.artist || "Unknown Artist";
      const albumName = item.album || "Unknown Album";
      const trackName = item.name || "Unknown Track";

      const artist = await db.artist.upsert({
        where: { providerArtistKey: `lastfm:${slugify(artistName)}` },
        update: {
          name: artistName,
          normalizedName: slugify(artistName),
        },
        create: {
          provider: "lastfm",
          providerArtistKey: `lastfm:${slugify(artistName)}`,
          name: artistName,
          normalizedName: slugify(artistName),
        },
      });

      const album = await db.album.upsert({
        where: { providerAlbumKey: `lastfm:${slugify(artistName)}:${slugify(albumName)}` },
        update: {
          name: albumName,
          normalizedName: slugify(albumName),
          artistId: artist.id,
          imageUrl: item.image || undefined,
        },
        create: {
          provider: "lastfm",
          providerAlbumKey: `lastfm:${slugify(artistName)}:${slugify(albumName)}`,
          name: albumName,
          normalizedName: slugify(albumName),
          artistId: artist.id,
          imageUrl: item.image || undefined,
        },
      });

      const track = await db.track.upsert({
        where: { providerTrackKey: `lastfm:${slugify(artistName)}:${slugify(trackName)}` },
        update: {
          name: trackName,
          normalizedName: slugify(trackName),
          artistId: artist.id,
          albumId: album.id,
        },
        create: {
          provider: "lastfm",
          providerTrackKey: `lastfm:${slugify(artistName)}:${slugify(trackName)}`,
          name: trackName,
          normalizedName: slugify(trackName),
          artistId: artist.id,
          albumId: album.id,
        },
      });

      const key = scrobbleKey(item);
      const existing = await db.scrobble.findUnique({
        where: {
          connectedProfileId_providerScrobbleKey: {
            connectedProfileId: profile.id,
            providerScrobbleKey: key,
          },
        },
      });

      if (existing) {
        await db.scrobble.update({
          where: { id: existing.id },
          data: {
            trackId: track.id,
            artistId: artist.id,
            albumId: album.id,
            trackNameRaw: trackName,
            artistNameRaw: artistName,
            albumNameRaw: albumName,
            nowPlaying: Boolean(item.nowPlaying),
            sourcePayloadJson: item,
          },
        });
        updated += 1;
      } else {
        await db.scrobble.create({
          data: {
            connectedProfileId: profile.id,
            provider: "lastfm",
            providerScrobbleKey: key,
            trackId: track.id,
            artistId: artist.id,
            albumId: album.id,
            trackNameRaw: trackName,
            artistNameRaw: artistName,
            albumNameRaw: albumName,
            scrobbledAt: item.playedAt ? new Date(item.playedAt) : new Date(),
            nowPlaying: Boolean(item.nowPlaying),
            sourcePayloadJson: item,
          },
        });
        inserted += 1;
      }
    }

    const windows = aggregateLastFmByWindow(recent);
    const now = new Date();
    const rollups = [
      { key: "24h", daysAgo: 1 },
      { key: "7d", daysAgo: 7 },
      { key: "30d", daysAgo: 30 },
    ] as const;

    for (const rollup of rollups) {
      const scoped = windows[rollup.key];
      const dayDate = new Date(now);
      dayDate.setUTCDate(now.getUTCDate() - rollup.daysAgo + 1);
      dayDate.setUTCHours(0, 0, 0, 0);

      await db.dailyRollup.upsert({
        where: {
          connectedProfileId_dayDate: {
            connectedProfileId: profile.id,
            dayDate,
          },
        },
        update: {
          totalScrobbles: scoped.totalPlays,
          uniqueTracks: scoped.tracks.length,
          uniqueArtists: scoped.artists.length,
          uniqueAlbums: scoped.albums.length,
          estimatedListeningMinutes: Math.round(scoped.totalPlays * 3.5),
          repeatRate: scoped.totalPlays ? Number(((scoped.totalPlays - scoped.tracks.length) / scoped.totalPlays).toFixed(2)) : 0,
          diversityIndex: scoped.totalPlays ? Number((scoped.artists.length / scoped.totalPlays).toFixed(2)) : 0,
        },
        create: {
          connectedProfileId: profile.id,
          dayDate,
          totalScrobbles: scoped.totalPlays,
          uniqueTracks: scoped.tracks.length,
          uniqueArtists: scoped.artists.length,
          uniqueAlbums: scoped.albums.length,
          estimatedListeningMinutes: Math.round(scoped.totalPlays * 3.5),
          repeatRate: scoped.totalPlays ? Number(((scoped.totalPlays - scoped.tracks.length) / scoped.totalPlays).toFixed(2)) : 0,
          diversityIndex: scoped.totalPlays ? Number((scoped.artists.length / scoped.totalPlays).toFixed(2)) : 0,
        },
      });
    }

    await buildPeriodSnapshot(profile.id, "7d");
    await buildPeriodSnapshot(profile.id, "30d");
    await generateInsights(profile.id, "7d");

    await db.connectedProfile.update({
      where: { id: profile.id },
      data: {
        lastSuccessfulSyncAt: new Date(),
        lastSyncStatus: "SUCCESS",
      },
    });

    await db.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        itemsFetched: recent.length,
        itemsInserted: inserted,
        itemsUpdated: updated,
      },
    });

    return { profileId: profile.id, itemsFetched: recent.length, inserted, updated };
  } catch (error) {
    await db.connectedProfile.update({
      where: { id: profile.id },
      data: { lastSyncStatus: "FAILED" },
    });

    await db.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : "Unknown sync error",
      },
    });

    throw error;
  }
}
