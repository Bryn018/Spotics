import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Clock, TrendingUp, Music, Heart, UserPlus, ListMusic, Play, Pause, Volume2, SkipForward, SkipBack } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

export function RecentActivity() {
  const [isPlaying, setIsPlaying] = useState(true);

  const nowPlaying = {
    track: 'Starboy',
    artist: 'The Weeknd, Daft Punk',
    album: 'Starboy',
    image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400',
    duration: '3:50',
    currentTime: '2:15',
    progress: 58.8
  };

  const activities = [
    {
      id: 1,
      type: 'Listened to',
      track: 'Blinding Lights',
      artist: 'The Weeknd',
      time: '5 minutes ago',
      image: 'https://images.unsplash.com/photo-1616663395403-2e0052b8e595?w=400',
      icon: Music,
      iconColor: 'from-purple-500 to-pink-500'
    },
    {
      id: 2,
      type: 'Saved to library',
      track: 'Heat Waves',
      artist: 'Glass Animals',
      time: '23 minutes ago',
      image: 'https://images.unsplash.com/photo-1770287329282-1fabdc26248b?w=400',
      icon: Heart,
      iconColor: 'from-red-500 to-pink-500'
    },
    {
      id: 3,
      type: 'Listened to',
      track: 'Levitating',
      artist: 'Dua Lipa',
      time: '1 hour ago',
      image: 'https://images.unsplash.com/photo-1672841821756-fc04525771c2?w=400',
      icon: Music,
      iconColor: 'from-purple-500 to-pink-500'
    },
    {
      id: 4,
      type: 'Discovered artist',
      track: 'New Artist',
      artist: 'Bon Iver',
      time: '2 hours ago',
      image: 'https://images.unsplash.com/photo-1512153129600-528cae82b06a?w=400',
      icon: UserPlus,
      iconColor: 'from-green-500 to-emerald-500'
    },
    {
      id: 5,
      type: 'Listened to',
      track: 'Stay',
      artist: 'The Kid LAROI',
      time: '3 hours ago',
      image: 'https://images.unsplash.com/photo-1563681543778-002ee8f3cd8a?w=400',
      icon: Music,
      iconColor: 'from-purple-500 to-pink-500'
    },
    {
      id: 6,
      type: 'Added to playlist',
      track: 'Good 4 U',
      artist: 'Olivia Rodrigo',
      time: '4 hours ago',
      image: 'https://images.unsplash.com/photo-1718217028088-a23cb3b277c4?w=400',
      icon: ListMusic,
      iconColor: 'from-blue-500 to-cyan-500'
    },
  ];

  const stats = [
    {
      label: 'Today',
      value: '42',
      change: '+8',
      unit: 'tracks'
    },
    {
      label: 'This Week',
      value: '312',
      change: '+24',
      unit: 'tracks'
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
      <CardContent className="p-6">
        {/* Now Playing - Compact */}
        <div className="mb-4 relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/30">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 animate-pulse"></div>
          
          <div className="relative p-3 flex items-center gap-3">
            {/* Album Art */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg blur-sm opacity-60"></div>
              <img
                src={nowPlaying.image}
                alt={nowPlaying.track}
                className="relative h-12 w-12 rounded-lg object-cover shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-gray-900 flex items-center justify-center">
                <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Now Playing</span>
              </div>
              <p className="font-semibold text-white text-sm truncate leading-tight">{nowPlaying.track}</p>
              <p className="text-xs text-gray-400 truncate">{nowPlaying.artist}</p>
              
              {/* Progress Bar */}
              <div className="mt-1.5 relative h-1 bg-gray-800/50 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${nowPlaying.progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Play/Pause Button */}
            <Button 
              onClick={() => setIsPlaying(!isPlaying)}
              size="icon"
              className="h-9 w-9 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/30 hover:scale-105 transition-all"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 text-white fill-white" />
              ) : (
                <Play className="h-4 w-4 text-white fill-white ml-0.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Activity Summary Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4 border border-purple-500/20"
            >
              <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
              <p className="text-xs text-gray-400 mb-1 relative z-10">{stat.label}</p>
              <div className="flex items-baseline gap-2 relative z-10">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <div className="flex items-center gap-1 text-green-400 text-xs font-medium">
                  <TrendingUp className="h-3 w-3" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 relative z-10">{stat.unit}</p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent pr-2">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div 
                key={activity.id} 
                className="relative flex items-start gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-900/20 hover:to-pink-900/20 transition-all border border-transparent hover:border-purple-500/20 group"
              >
                {/* Timeline connector */}
                {index !== activities.length - 1 && (
                  <div className="absolute left-[26px] top-[52px] w-px h-[calc(100%+12px)] bg-gradient-to-b from-purple-500/30 to-transparent"></div>
                )}
                
                <div className="relative">
                  <img
                    src={activity.image}
                    alt={activity.track}
                    className="h-12 w-12 rounded-lg object-cover ring-2 ring-gray-800 group-hover:ring-purple-500/30 transition-all shadow-lg"
                  />
                  <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br ${activity.iconColor} border-2 border-gray-900 flex items-center justify-center`}>
                    <Icon className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-purple-400 font-medium mb-1">{activity.type}</p>
                  <p className="font-semibold text-white truncate text-sm mb-0.5">{activity.track}</p>
                  <p className="text-xs text-gray-400 truncate">{activity.artist}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                    <Clock className="h-3 w-3" />
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="mt-6 pt-4 border-t border-gray-800/50">
          <Button className="w-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 text-purple-400 border border-purple-500/30 hover:border-purple-500/50 transition-all">
            View All Activity
          </Button>
        </div>

        {/* Listening Score */}
        <div className="mt-6 relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 p-4 border border-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 animate-pulse"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Your Listening Score</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">8.7/10</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-400 text-sm font-medium mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>+0.5</span>
                </div>
                <p className="text-xs text-gray-500">This week</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: '87%' }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30 animate-pulse"></div>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">Based on listening time, variety, and engagement</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}