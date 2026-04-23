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
        <div
          key={index}
          className="rounded-2xl bg-[#121212] border border-white/[0.06] p-6 hover:border-white/10 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-green-400 mt-2">{stat.change} from last month</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <stat.icon className="h-6 w-6 text-[#1DB954]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
