import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Activity, Clock, Music, Heart, ListMusic, Play, Disc } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Activity as ActivityType } from '../types';

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activities: ActivityType[];
}

const activityIcons: Record<string, typeof Music> = {
  listen: Music,
  save: Heart,
  playlist: ListMusic,
  discover: Disc,
  listened: Music,
};

const activityLabels: Record<string, string> = {
  listen: 'Listened to',
  save: 'Saved to library',
  playlist: 'Added to playlist',
  discover: 'Discovered',
  listened: 'Listened to',
};

const activityColors: Record<string, string> = {
  listen: 'from-purple-500 to-pink-500',
  save: 'from-red-500 to-pink-500',
  playlist: 'from-blue-500 to-cyan-500',
  discover: 'from-green-500 to-teal-500',
  listened: 'from-purple-500 to-pink-500',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatDuration(ms?: number) {
  if (!ms) return '';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function ActivityDialog({ open, onOpenChange, activities }: ActivityDialogProps) {
  const songs = activities.map((activity, index) => {
    const Icon = activityIcons[activity.activity_type] ?? Music;
    const image = activity.metadata?.image ?? null;
    const duration = formatDuration(activity.metadata?.durationMs);
    return {
      id: activity.id,
      track: activity.title,
      artist: activity.subtitle ?? '',
      time: timeAgo(activity.occurred_at),
      image,
      Icon,
      iconColor: activityColors[activity.activity_type] ?? 'from-purple-500 to-pink-500',
      type: activityLabels[activity.activity_type] ?? 'Listened to',
      duration,
      index,
    };
  });

  const latestAlbum = activities.length > 0 ? activities[0] : null;
  const album = latestAlbum
    ? {
        id: latestAlbum.id,
        title: latestAlbum.metadata?.album ?? latestAlbum.title,
        artist: latestAlbum.subtitle ?? '',
        tracks: activities.filter((a) => a.metadata?.album === latestAlbum.metadata?.album).length || 1,
        duration: formatDuration(latestAlbum.metadata?.durationMs),
        image: latestAlbum.metadata?.image ?? null,
        releaseYear: new Date(latestAlbum.occurred_at).getFullYear().toString(),
        type: 'Album',
      }
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl text-white">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Activity className="h-6 w-6 text-purple-400" />
            </div>
            All Activity
          </DialogTitle>
          <DialogDescription>
            Your recent listening history and saved content
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {/* Album Section */}
          {album && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                <h3 className="text-lg font-bold text-white">Recently Played Album</h3>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 p-6"
              >
                <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>

                <div className="relative flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur-md opacity-60 transition-opacity"></div>
                    <ImageWithFallback
                      src={album.image}
                      alt={album.title}
                      gradientSeed={album.title}
                      className="relative h-28 w-28 rounded-xl object-cover shadow-2xl ring-2 ring-purple-500/30"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">{album.type}</span>
                      </div>
                      <Disc className="h-4 w-4 text-purple-400" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-1">{album.title}</h4>
                    <p className="text-gray-400 mb-3">{album.artist} • {album.releaseYear}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{album.tracks} tracks</span>
                      <span>•</span>
                      <span>{album.duration}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Songs Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1 w-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
              <h3 className="text-lg font-bold text-white">Recent Songs</h3>
            </div>

            {songs.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity yet. Start listening on Spotify!</p>
              </div>
            )}

            <div className="space-y-3">
              {songs.map((song) => {
                const Icon = song.Icon;
                return (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: song.index * 0.03 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-purple-500/50 transition-all cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="relative p-4 flex items-center gap-4">
                      {/* Album Art with Play Button Overlay */}
                      <div className="relative flex-shrink-0">
                        <ImageWithFallback
                          src={song.image}
                          alt={song.track}
                          gradientSeed={song.track}
                          className="h-20 w-20 rounded-lg object-cover shadow-lg ring-2 ring-gray-700/50 group-hover:ring-purple-500/40 transition-all"
                        />

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                            <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                          </div>
                        </div>

                        {/* Activity Icon Badge */}
                        <div className={`absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-br ${song.iconColor} border-2 border-gray-900 flex items-center justify-center shadow-lg`}>
                          <Icon className="h-3 w-3 text-white" />
                        </div>
                      </div>

                      {/* Song Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">{song.type}</span>
                          <span className="text-gray-600">•</span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{song.time}</span>
                          </div>
                        </div>
                        <h4 className="font-bold text-white text-base mb-1 group-hover:text-purple-400 transition-colors truncate">{song.track}</h4>
                        <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                      </div>

                      {/* Duration */}
                      {song.duration && (
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Music className="h-4 w-4" />
                            <span className="font-medium">{song.duration}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
