import { Card, CardContent } from './ui/card';
import { Music, Heart, ListPlus, UserPlus, Clock } from 'lucide-react';
import type { Activity } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

const activityIcons: Record<string, typeof Music> = {
  listen: Music,
  save: Heart,
  playlist: ListPlus,
  discover: UserPlus,
  listened: Music,
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

export function RecentActivity({ activities }: { activities?: Activity[] }) {
  const activitiesToShow = activities ?? [];

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50">
      <CardContent className="p-4">
        <div className="space-y-1">
          {activitiesToShow.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No recent activity. Start listening on Spotify!</p>
            </div>
          )}
          {activitiesToShow.map((activity) => {
            const Icon = activityIcons[activity.activity_type] ?? Music;
            const image = (activity.metadata as any)?.image;
            const artist = (activity.metadata as any)?.artist ?? activity.subtitle;

            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                {image ? (
                  <ImageWithFallback
                    src={image}
                    alt={activity.subtitle ?? ''}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-green-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-400 text-xs">{activity.title}</p>
                  <p className="text-white text-sm font-medium truncate">{activity.subtitle}</p>
                  <p className="text-gray-500 text-xs truncate">{artist}</p>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <Clock className="h-3 w-3" />
                  <span>{timeAgo(activity.occurred_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
