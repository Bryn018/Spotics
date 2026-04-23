import { Card, CardContent } from './ui/card';
import { Clock, Music, Headphones, TrendingUp } from 'lucide-react';
import type { DashboardPayload } from '../types';

const formatMinutes = (mins: number) => {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours}h ${minutes}m`;
};

interface StatsOverviewProps {
  stats?: DashboardPayload['stats'] | null;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statItems = [
    {
      icon: Clock,
      label: 'Total Listening Time',
      value: stats?.totalMinutes ? formatMinutes(stats.totalMinutes) : '0h 0m',
      change: '+12%',
      trend: 'up' as const,
    },
    {
      icon: Music,
      label: 'Tracks Played',
      value: stats?.totalTracks ? stats.totalTracks.toLocaleString() : '0',
      change: '+23%',
      trend: 'up' as const,
    },
    {
      icon: Headphones,
      label: 'Unique Artists',
      value: stats?.totalArtists ? stats.totalArtists.toLocaleString() : '0',
      change: '+8%',
      trend: 'up' as const,
    },
    {
      icon: TrendingUp,
      label: 'Avg. Daily Mins',
      value: stats?.averageDailyMinutes ? Math.round(stats.averageDailyMinutes).toString() : '0',
      change: '+5%',
      trend: 'up' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat, index) => (
        <Card
          key={index}
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 hover:border-purple-500/50 transition-all hover:scale-[1.01] shadow-xl"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-green-400 mt-2">{stat.change} from last month</p>
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
