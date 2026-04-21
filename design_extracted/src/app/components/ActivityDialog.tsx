import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Activity, Clock, Music, Heart, UserPlus, ListMusic, Play, Disc } from 'lucide-react';
import { motion } from 'motion/react';

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivityDialog({ open, onOpenChange }: ActivityDialogProps) {
  const songs = [
    {
      id: 1,
      track: 'Blinding Lights',
      artist: 'The Weeknd',
      time: '5 minutes ago',
      image: 'https://images.unsplash.com/photo-1616663395403-2e0052b8e595?w=400',
      icon: Music,
      iconColor: 'from-purple-500 to-pink-500',
      type: 'Listened to',
      duration: '3:22'
    },
    {
      id: 2,
      track: 'Heat Waves',
      artist: 'Glass Animals',
      time: '23 minutes ago',
      image: 'https://images.unsplash.com/photo-1770287329282-1fabdc26248b?w=400',
      icon: Heart,
      iconColor: 'from-red-500 to-pink-500',
      type: 'Saved to library',
      duration: '3:58'
    },
    {
      id: 3,
      track: 'Levitating',
      artist: 'Dua Lipa',
      time: '1 hour ago',
      image: 'https://images.unsplash.com/photo-1672841821756-fc04525771c2?w=400',
      icon: Music,
      iconColor: 'from-purple-500 to-pink-500',
      type: 'Listened to',
      duration: '3:23'
    },
    {
      id: 4,
      track: 'Stay',
      artist: 'The Kid LAROI, Justin Bieber',
      time: '3 hours ago',
      image: 'https://images.unsplash.com/photo-1563681543778-002ee8f3cd8a?w=400',
      icon: Music,
      iconColor: 'from-purple-500 to-pink-500',
      type: 'Listened to',
      duration: '2:21'
    },
    {
      id: 5,
      track: 'Good 4 U',
      artist: 'Olivia Rodrigo',
      time: '4 hours ago',
      image: 'https://images.unsplash.com/photo-1718217028088-a23cb3b277c4?w=400',
      icon: ListMusic,
      iconColor: 'from-blue-500 to-cyan-500',
      type: 'Added to playlist',
      duration: '2:58'
    },
    {
      id: 6,
      track: 'Save Your Tears',
      artist: 'The Weeknd',
      time: '5 hours ago',
      image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400',
      icon: Music,
      iconColor: 'from-purple-500 to-pink-500',
      type: 'Listened to',
      duration: '3:35'
    },
    {
      id: 7,
      track: 'Peaches',
      artist: 'Justin Bieber ft. Daniel Caesar',
      time: '6 hours ago',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      icon: Music,
      iconColor: 'from-purple-500 to-pink-500',
      type: 'Listened to',
      duration: '3:18'
    },
    {
      id: 8,
      track: 'Drivers License',
      artist: 'Olivia Rodrigo',
      time: '7 hours ago',
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
      icon: Heart,
      iconColor: 'from-red-500 to-pink-500',
      type: 'Saved to library',
      duration: '4:02'
    },
    {
      id: 9,
      track: 'Montero',
      artist: 'Lil Nas X',
      time: '8 hours ago',
      image: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400',
      icon: Music,
      iconColor: 'from-purple-500 to-pink-500',
      type: 'Listened to',
      duration: '2:17'
    }
  ];

  const album = {
    id: 1,
    title: 'After Hours',
    artist: 'The Weeknd',
    tracks: 14,
    duration: '56:16',
    image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400',
    releaseYear: '2020',
    type: 'Album'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-950 light:from-white light:to-gray-50 border-gray-800 light:border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl text-white light:text-gray-900">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 light:from-purple-500/10 light:to-pink-500/10">
              <Activity className="h-6 w-6 text-purple-400 light:text-purple-600" />
            </div>
            All Activity
          </DialogTitle>
          <DialogDescription className="light:text-gray-600">
            Your recent listening history and saved content
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {/* Album Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <h3 className="text-lg font-bold text-white light:text-gray-900">Recently Played Album</h3>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 light:from-purple-100/50 light:to-pink-100/50 border border-purple-500/30 light:border-purple-300 p-6"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
              
              <div className="relative flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur-md opacity-60 transition-opacity"></div>
                  <img
                    src={album.image}
                    alt={album.title}
                    className="relative h-28 w-28 rounded-xl object-cover shadow-2xl ring-2 ring-purple-500/30"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 light:from-purple-500/10 light:to-pink-500/10 border border-purple-500/30 light:border-purple-300">
                      <span className="text-xs font-semibold text-purple-400 light:text-purple-600 uppercase tracking-wider">{album.type}</span>
                    </div>
                    <Disc className="h-4 w-4 text-purple-400 light:text-purple-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-white light:text-gray-900 mb-1">{album.title}</h4>
                  <p className="text-gray-400 light:text-gray-600 mb-3">{album.artist} • {album.releaseYear}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 light:text-gray-500">
                    <span>{album.tracks} tracks</span>
                    <span>•</span>
                    <span>{album.duration}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Songs Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1 w-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
              <h3 className="text-lg font-bold text-white light:text-gray-900">Recent Songs</h3>
            </div>

            <div className="space-y-3">
              {songs.map((song, index) => {
                const Icon = song.icon;
                return (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 light:from-white light:to-gray-50 border border-gray-700/50 light:border-gray-200 hover:border-purple-500/50 light:hover:border-purple-400 transition-all cursor-pointer"
                  >
                    {/* Hover gradient effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="relative p-4 flex items-center gap-4">
                      {/* Album Art with Play Button Overlay */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={song.image}
                          alt={song.track}
                          className="h-20 w-20 rounded-lg object-cover shadow-lg ring-2 ring-gray-700/50 light:ring-gray-300 group-hover:ring-purple-500/40 transition-all"
                        />
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                            <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                          </div>
                        </div>
                        
                        {/* Activity Icon Badge */}
                        <div className={`absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-br ${song.iconColor} border-2 border-gray-900 light:border-white flex items-center justify-center shadow-lg`}>
                          <Icon className="h-3 w-3 text-white" />
                        </div>
                      </div>

                      {/* Song Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-purple-400 light:text-purple-600 uppercase tracking-wider">{song.type}</span>
                          <span className="text-gray-600 light:text-gray-400">•</span>
                          <div className="flex items-center gap-1 text-xs text-gray-500 light:text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{song.time}</span>
                          </div>
                        </div>
                        <h4 className="font-bold text-white light:text-gray-900 text-base mb-1 group-hover:text-purple-400 light:group-hover:text-purple-600 transition-colors">{song.track}</h4>
                        <p className="text-sm text-gray-400 light:text-gray-600">{song.artist}</p>
                      </div>

                      {/* Duration and Actions */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 text-sm text-gray-400 light:text-gray-500">
                          <Music className="h-4 w-4" />
                          <span className="font-medium">{song.duration}</span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full hover:bg-purple-500/20"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Heart className="h-4 w-4 text-purple-400 light:text-purple-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full hover:bg-purple-500/20"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <ListMusic className="h-4 w-4 text-purple-400 light:text-purple-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800 light:border-gray-200">
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