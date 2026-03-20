import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Activity as ActivityIcon, Clock, Disc, Heart, ListMusic, Music, Play, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useDashboardData } from '../context/DashboardContext';
import { formatDistanceToNow } from 'date-fns';

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const iconByType: Record<string, typeof Music> = {
  played: Music,
  listened: Music,
  saved: Heart,
  playlist: ListMusic,
};

const colorByType: Record<string, string> = {
  played: 'from-purple-500 to-pink-500',
  listened: 'from-purple-500 to-pink-500',
  saved: 'from-red-500 to-pink-500',
  playlist: 'from-blue-500 to-cyan-500',
};

export function ActivityDialog({ open, onOpenChange }: ActivityDialogProps) {
  const { data } = useDashboardData();
  const activities = data?.activities ?? [];
  const topAlbum = data?.summary?.payload?.topAlbums?.[0];

  const songs = activities.slice(0, 15).map((activity) => {
    const key = activity.activity_type.toLowerCase();
    const icon = iconByType[key] ?? Music;
    const color = colorByType[key] ?? 'from-purple-500 to-pink-500';
    return {
      id: activity.id,
      track: activity.title,
      artist: activity.subtitle ?? 'Unknown artist',
      time: formatDistanceToNow(new Date(activity.occurred_at), { addSuffix: true }),
      image: activity.metadata?.image ?? undefined,
      icon,
      iconColor: color,
      type: activity.activity_type,
      duration: formatDuration(activity.metadata?.durationMs),
    };
  });

  const album = topAlbum
    ? {
        title: topAlbum.name,
        artist: topAlbum.artist,
        tracks: topAlbum.plays,
        duration: `${Math.round(topAlbum.totalMinutes)} min`,
        image: topAlbum.image ?? undefined,
        releaseYear: new Date().getFullYear(),
        type: 'Top album',
      }
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-950 light:from-white light:to-gray-50 border-gray-800 light:border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl text-white light:text-gray-900">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 light:from-purple-500/10 light:to-pink-500/10">
              <ActivityIcon className="h-6 w-6 text-purple-400 light:text-purple-600" />
            </div>
            All Activity
          </DialogTitle>
          <DialogDescription className="light:text-gray-600">Your recent listening history</DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-8">
          {album && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                <h3 className="text-lg font-bold text-white light:text-gray-900">Recently Played Album</h3>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 light:from-purple-100/50 light:to-pink-100/50 border border-purple-500/30 light:border-purple-300 p-6"
              >
                <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
                <div className="relative flex items-center gap-6">
                  {album.image ? (
                    <img src={album.image} alt={album.title} className="h-28 w-28 rounded-xl object-cover shadow-2xl ring-2 ring-purple-500/30" />
                  ) : (
                    <div className="h-28 w-28 rounded-xl bg-gray-800 flex items-center justify-center">
                      <Disc className="h-10 w-10 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">{album.type}</span>
                      </div>
                      <TrendingUp className="h-4 w-4 text-purple-400" />
                    </div>
                    <h4 className="text-2xl font-bold text-white light:text-gray-900 mb-1">{album.title}</h4>
                    <p className="text-gray-400 light:text-gray-600 mb-3">{album.artist}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{album.tracks} plays</span>
                      <span>•</span>
                      <span>{album.duration}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>
          )}

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1 w-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" />
              <h3 className="text-lg font-bold text-white light:text-gray-900">Recent Songs</h3>
            </div>

            {songs.length === 0 ? (
              <p className="text-gray-500 text-sm">No activity yet. Sync your Spotify history to get started.</p>
            ) : (
              <div className="space-y-3">
                {songs.map((song, index) => {
                  const Icon = song.icon;
                  return (
                    <motion.div
                      key={song.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 light:from-white light:to-gray-50 border border-gray-700/50 light:border-gray-200 hover:border-purple-500/50 transition-all"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative p-4 flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          {song.image ? (
                            <img
                              src={song.image}
                              alt={song.track}
                              className="h-20 w-20 rounded-lg object-cover shadow-lg ring-2 ring-gray-700/50 light:ring-gray-300"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-lg bg-gray-800 flex items-center justify-center">
                              <Music className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                          <div className={`absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-br ${song.iconColor} border-2 border-gray-900 light:border-white flex items-center justify-center shadow-lg`}>
                            <Icon className="h-3 w-3 text-white" />
                          </div>
                          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                              <Play className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">{song.type}</span>
                            <span className="text-gray-600">•</span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{song.time}</span>
                            </div>
                          </div>
                          <h4 className="font-bold text-white light:text-gray-900 text-base mb-1 truncate">{song.track}</h4>
                          <p className="text-sm text-gray-400 light:text-gray-600 truncate">{song.artist}</p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Music className="h-4 w-4" />
                            <span className="font-medium">{song.duration}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-purple-500/20">
                              <Heart className="h-4 w-4 text-purple-400" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-purple-500/20">
                              <ListMusic className="h-4 w-4 text-purple-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800 light:border-gray-200">
          <Button onClick={() => onOpenChange(false)} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatDuration(durationMs?: number | null) {
  if (!durationMs) return '—';
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.round((durationMs % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}
