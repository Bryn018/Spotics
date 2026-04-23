import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Music, Heart, ListPlus, UserPlus, Clock, ChevronRight } from 'lucide-react';
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

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">Recent Activity</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-gray-400 hover:text-white group"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-1">
          {activitiesToShow.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No recent activity. Start listening on Spotify!</p>
            </div>
          )}
          {activitiesToShow.map((activity) => {
            const Icon = activityIcons[activity.activity_type] ?? Music;
            const image = (activity.metadata as any)?.image;
            const album = (activity.metadata as any)?.album;

            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <ImageWithFallback
                  src={image}
                  alt={activity.title}
                  gradientSeed={activity.title}
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-gray-400 text-xs truncate">{activity.subtitle}</p>
                  {album && <p className="text-gray-500 text-xs truncate">{album}</p>}
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-xs shrink-0">
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
