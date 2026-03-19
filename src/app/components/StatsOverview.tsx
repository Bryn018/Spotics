import { Clock, Headphones, Music, TrendingUp } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { useDashboardData } from '../context/DashboardContext';

const formatDuration = (minutes = 0) => {
  if (!minutes) return '0m';
  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  if (!hours) return `${Math.round(minutes)}m`;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
};

export function StatsOverview() {
  const { data } = useDashboardData();
  const stats = data?.summary?.payload?.stats;

  const items = [
    {
      icon: Clock,
      label: 'Total Listening Time',
      value: formatDuration(stats?.totalMinutes ?? 0),
      change: '+12%',
    },
    {
      icon: Music,
      label: 'Tracks Played',
      value: (stats?.totalTracks ?? 0).toLocaleString(),
      change: '+23%',
    },
    {
      icon: Headphones,
      label: 'Unique Artists',
      value: (stats?.totalArtists ?? 0).toLocaleString(),
      change: '+8%',
    },
    {
      icon: TrendingUp,
      label: 'Avg. Daily Mins',
      value: Math.round(stats?.averageDailyMinutes ?? 0).toString(),
      change: '+5%',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((stat) => (
        <Card
          key={stat.label}
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800 hover:border-purple-500/50 transition-colors"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-green-400 mt-2">{stat.change} vs prior window</p>
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
