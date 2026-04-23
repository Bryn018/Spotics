import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Music, Heart, ListPlus, UserPlus, Clock, ChevronRight, TrendingUp } from 'lucide-react';
import type { Activity } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';

const activityIcons: Record<string, typeof Music> = {
  listen: Music,
  save: Heart,
  playlist: ListPlus,
  discover: UserPlus,
  listened: Music,
};

const activityColors: Record<string, string> = {
  listen: 'from-purple-500 to-pink-500',
  save: 'from-red-500 to-pink-500',
  playlist: 'from-blue-500 to-cyan-500',
  discover: 'from-green-500 to-emerald-500',
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

export function RecentActivity({ activities, onViewAll }: { activities?: Activity[]; onViewAll?: () => void }) {
  const activitiesToShow = activities ?? [];

  // Compute today / this week stats
  const now = Date.now();
  const todayCount = activitiesToShow.filter((a) => now - new Date(a.occurred_at).getTime() < 24 * 60 * 60 * 1000).length;
  const weekCount = activitiesToShow.filter((a) => now - new Date(a.occurred_at).getTime() < 7 * 24 * 60 * 60 * 1000).length;

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
      <CardContent className="p-6">
        {/* Activity Summary Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4 border border-purple-500/20">
            <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl" />
            <p className="text-xs text-gray-400 mb-1 relative z-10">Today</p>
            <div className="flex items-baseline gap-2 relative z-10">
              <p className="text-2xl font-bold text-white">{todayCount}</p>
              <p className="text-xs text-gray-500">tracks</p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4 border border-purple-500/20">
            <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl" />
            <p className="text-xs text-gray-400 mb-1 relative z-10">This Week</p>
            <div className="flex items-baseline gap-2 relative z-10">
              <p className="text-2xl font-bold text-white">{weekCount}</p>
              <p className="text-xs text-gray-500">tracks</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
        </div>

        {/* Activity Feed */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent pr-2">
          {activitiesToShow.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              <p>No recent activity. Start listening on Spotify!</p>
            </div>
          )}
          {activitiesToShow.slice(0, 8).map((activity, index) => {
            const Icon = activityIcons[activity.activity_type] ?? Music;
            const iconColor = activityColors[activity.activity_type] ?? 'from-purple-500 to-pink-500';
            const image = (activity.metadata as any)?.image;

            return (
              <div
                key={activity.id}
                className="relative flex items-start gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-900/20 hover:to-pink-900/20 transition-all border border-transparent hover:border-purple-500/20 group"
              >
                {/* Timeline connector */}
                {index !== activitiesToShow.slice(0, 8).length - 1 && (
                  <div className="absolute left-[26px] top-[52px] w-px h-[calc(100%+12px)] bg-gradient-to-b from-purple-500/30 to-transparent" />
                )}

                <div className="relative">
                  <ImageWithFallback
                    src={image}
                    alt={activity.title}
                    gradientSeed={activity.title}
                    className="h-12 w-12 rounded-lg object-cover ring-2 ring-gray-800 group-hover:ring-purple-500/30 transition-all shadow-lg"
                  />
                  <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br ${iconColor} border-2 border-gray-900 flex items-center justify-center`}>
                    <Icon className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-purple-400 font-medium mb-1 capitalize">{activity.activity_type}</p>
                  <p className="font-semibold text-white truncate text-sm mb-0.5">{activity.title}</p>
                  <p className="text-xs text-gray-400 truncate">{activity.subtitle}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                    <Clock className="h-3 w-3" />
                    <span>{timeAgo(activity.occurred_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="mt-6 pt-4 border-t border-gray-800/50">
          <Button
            className="w-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 text-purple-400 border border-purple-500/30 hover:border-purple-500/50 transition-all"
            onClick={onViewAll}
          >
            View All Activity
          </Button>
        </div>

        {/* Listening Score */}
        <div className="mt-6 relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 p-4 border border-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 animate-pulse" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Your Listening Score</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {Math.min(10, Math.round((weekCount || 1) / 5))}/10
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-400 text-sm font-medium mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Active</span>
                </div>
                <p className="text-xs text-gray-500">This week</p>
              </div>
            </div>
            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((weekCount || 1) * 2, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Based on listening time, variety, and engagement</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
