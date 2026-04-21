import { Card, CardContent } from './ui/card';
import { Music, Heart, ListPlus, UserPlus, Clock } from 'lucide-react';
import type { Activity } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

const demoActivities = [
  { id: '1', activity_type: 'listen', title: 'Listened to', subtitle: 'Blinding Lights', metadata: { artist: 'The Weeknd', image: 'https://images.unsplash.com/photo-1616663395403-2e0052b8e595?w=400' }, occurred_at: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: '2', activity_type: 'save', title: 'Saved to library', subtitle: 'Heat Waves', metadata: { artist: 'Glass Animals', image: 'https://images.unsplash.com/photo-1770287329282-1fabdc26248b?w=400' }, occurred_at: new Date(Date.now() - 23 * 60000).toISOString() },
  { id: '3', activity_type: 'listen', title: 'Listened to', subtitle: 'Levitating', metadata: { artist: 'Dua Lipa', image: 'https://images.unsplash.com/photo-1672841821756-fc04525771c2?w=400' }, occurred_at: new Date(Date.now() - 60 * 60000).toISOString() },
  { id: '4', activity_type: 'discover', title: 'Discovered artist', subtitle: 'Bon Iver', metadata: { artist: 'Bon Iver', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400' }, occurred_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '5', activity_type: 'listen', title: 'Listened to', subtitle: 'Stay', metadata: { artist: 'The Kid LAROI', image: 'https://images.unsplash.com/photo-1563681543778-002ee8f3cd8a?w=400' }, occurred_at: new Date(Date.now() - 3 * 3600000).toISOString() },
];

const activityIcons: Record<string, typeof Music> = {
  listen: Music,
  save: Heart,
  playlist: ListPlus,
  discover: UserPlus,
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
  const activitiesToShow = activities?.length ? activities : demoActivities;

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50">
      <CardContent className="p-4">
        <div className="space-y-1">
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
