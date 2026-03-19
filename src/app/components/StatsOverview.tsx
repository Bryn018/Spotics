import { Clock, Music, Headphones, TrendingUp } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { useDashboardData } from '../context/DashboardContext';

const formatDuration = (minutes: number) => {
  if (!minutes) return '0m';
  if (minutes < 90) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
};

export function StatsOverview() {
  const { data } = useDashboardData();
  const stats = data?.summary?.payload?.stats;

  const items = [
    {
      icon: Clock,
      label: 'Total Listening Time',
      value: formatDuration(stats?.totalMinutes ?? 0),
      detail: 'Minutes streamed this window',
    },
    {
      icon: Music,
      label: 'Tracks Played',
      value: (stats?.totalTracks ?? 0).toLocaleString(),
      detail: 'Unique songs you replayed',
    },
    {
      icon: Headphones,
      label: 'Unique Artists',
      value: (stats?.totalArtists ?? 0).toLocaleString(),
      detail: 'Voices in heavy rotation',
    },
    {
      icon: TrendingUp,
      label: 'Avg. Daily Minutes',
      value: Math.round(stats?.averageDailyMinutes ?? 0).toString(),
      detail: 'Consistency over the period',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((stat) => (
        <Card
          key={stat.label}
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800 hover:border-purple-500/40 transition-colors"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-2">{stat.detail}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                <stat.icon className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
