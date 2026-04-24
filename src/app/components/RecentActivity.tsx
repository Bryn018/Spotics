import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Activity, Clock, Music, User, Disc3, Headphones } from 'lucide-react';
import type { Activity as ActivityType } from '../types';

interface RecentActivityProps {
  activities: ActivityType[];
}

const activityIcons: Record<string, typeof Music> = {
  track: Music,
  artist: User,
  album: Disc3,
  playlist: Headphones,
  default: Activity,
};

export function RecentActivity({ activities }: RecentActivityProps) {
  const displayActivities = activities.length > 0 ? activities : [];

  const formatTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
            <Activity className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-white">Recent Activity</CardTitle>
            <p className="text-sm text-gray-400">Your latest listening moments</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayActivities.slice(0, 6).map((activity) => {
          const Icon = activityIcons[activity.activity_type] || activityIcons.default;
          return (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all"
            >
              <div className="flex-shrink-0">
                <img
                  src={activity.metadata?.image || '/placeholder-album.svg'}
                  alt={activity.title}
                  className="h-10 w-10 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-album.svg';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                {activity.subtitle && (
                  <p className="text-xs text-gray-400 truncate">{activity.subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{formatTime(activity.occurred_at)}</span>
              </div>
            </div>
          );
        })}
        {displayActivities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
