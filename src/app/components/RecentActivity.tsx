import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Music } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useDashboardData } from '../context/DashboardContext';
import { ActivityDialog } from './ActivityDialog';

export function RecentActivity() {
  const { data } = useDashboardData();
  const activities = data?.activities ?? [];
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);

  if (activities.length === 0) {
    return <EmptyState message="Recent plays will appear after your next sync." />;
  }

  return (
    <>
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
              <CardTitle className="text-xl text-white">Recent Activity</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-400 hover:text-purple-300 text-xs"
              onClick={() => setActivityDialogOpen(true)}
            >
              View all
            </Button>
          </div>
          <p className="text-sm text-gray-400 mt-2">Latest 25 items pulled directly from Spotify</p>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-900/20 hover:to-pink-900/20 transition-all border border-transparent hover:border-purple-500/20"
            >
              {activity.metadata?.image ? (
                <img
                  src={activity.metadata.image}
                  alt={activity.title}
                  className="h-12 w-12 rounded-lg object-cover ring-2 ring-gray-800"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500 ring-2 ring-gray-800">
                  <Music className="h-5 w-5" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-purple-400 font-medium uppercase tracking-wide">{activity.activity_type}</p>
                <p className="font-semibold text-white truncate">{activity.title}</p>
                {activity.subtitle && <p className="text-xs text-gray-400 truncate">{activity.subtitle}</p>}
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(activity.occurred_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <ActivityDialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen} />
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 border-dashed border-gray-800 text-center py-12">
      <CardContent>
        <p className="text-gray-400">{message}</p>
      </CardContent>
    </Card>
  );
}
