import { Music, Heart, ListPlus, UserPlus, Clock, TrendingUp } from 'lucide-react';
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
  listen: 'bg-purple-500',
  save: 'bg-rose-500',
  playlist: 'bg-blue-500',
  discover: 'bg-green-500',
  listened: 'bg-purple-500',
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

  // Compute today / this week stats from actual activities
  const now = Date.now();
  const todayCount = activitiesToShow.filter((a) => now - new Date(a.occurred_at).getTime() < 24 * 60 * 60 * 1000).length;
  const weekCount = activitiesToShow.filter((a) => now - new Date(a.occurred_at).getTime() < 7 * 24 * 60 * 60 * 1000).length;

  return (
    <div className="rounded-2xl bg-[#121212] border border-white/[0.06] overflow-hidden">
      <div className="p-6 pb-4">
        <h2 className="text-xl font-bold text-white">Recent Activity</h2>
      </div>
      <div className="px-4 pb-4">
        {/* Activity Summary Stats */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#1a1a1a] border border-white/[0.06] p-4">
            <p className="text-xs text-gray-500 mb-1">Today</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-white">{todayCount}</p>
              <p className="text-xs text-gray-500">tracks</p>
            </div>
          </div>
          <div className="rounded-xl bg-[#1a1a1a] border border-white/[0.06] p-4">
            <p className="text-xs text-gray-500 mb-1">This Week</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-white">{weekCount}</p>
              <p className="text-xs text-gray-500">tracks</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        {/* Activity Feed */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {activitiesToShow.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              <p>No recent activity. Start listening on Spotify!</p>
            </div>
          )}
          {activitiesToShow.slice(0, 8).map((activity) => {
            const Icon = activityIcons[activity.activity_type] ?? Music;
            const iconColor = activityColors[activity.activity_type] ?? 'bg-purple-500';
            const image = (activity.metadata as any)?.image;

            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-all group cursor-pointer"
              >
                <div className="relative flex-shrink-0 w-11 h-11">
                  <ImageWithFallback
                    src={image}
                    alt={activity.title}
                    gradientSeed={activity.title}
                    className="w-full h-full rounded-lg object-cover ring-1 ring-white/[0.06]"
                  />
                  <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ${iconColor} border-2 border-[#121212] flex items-center justify-center`}>
                    <Icon className="h-2 w-2 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-green-400 font-medium mb-0.5 capitalize">{activity.activity_type}</p>
                  <p className="font-semibold text-white truncate text-sm">{activity.title}</p>
                  <p className="text-xs text-gray-500 truncate">{activity.subtitle}</p>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-gray-600 shrink-0">
                  <Clock className="h-3 w-3" />
                  <span>{timeAgo(activity.occurred_at)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <Button
            className="w-full bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 border border-white/[0.06] hover:border-white/10 transition-all"
            onClick={onViewAll}
          >
            View All Activity
          </Button>
        </div>

        {/* Listening Score */}
        <div className="mt-4 rounded-xl bg-[#1a1a1a] border border-white/[0.06] p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Your Listening Score</p>
              <p className="text-3xl font-bold text-white">
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
              className="absolute inset-y-0 left-0 bg-[#1DB954] rounded-full transition-all duration-500"
              style={{ width: `${Math.min((weekCount || 1) * 2, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">Based on listening time, variety, and engagement</p>
        </div>
      </div>
    </div>
  );
}
