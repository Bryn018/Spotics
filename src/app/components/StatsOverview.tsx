import { Card, CardContent } from './ui/card';
import { Music, Clock, Users, Disc3, TrendingUp, Flame } from 'lucide-react';
import type { DashboardPayload } from '../types';

interface StatsOverviewProps {
  data?: DashboardPayload['stats'];
}

export function StatsOverview({ data }: StatsOverviewProps) {
  const stats = data || {
    totalMinutes: 0,
    totalTracks: 0,
    totalArtists: 0,
    averageDailyMinutes: 0,
    currentStreak: 0,
    peakHour: 'N/A',
    bestDay: 'N/A',
    songsThisWeek: 0,
  };

  const items = [
    {
      icon: Music,
      label: 'Total Tracks',
      value: stats.totalTracks.toLocaleString(),
      color: 'text-green-400',
      bg: 'from-green-500/20 to-emerald-500/20',
    },
    {
      icon: Clock,
      label: 'Listening Time',
      value: `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`,
      color: 'text-blue-400',
      bg: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      icon: Users,
      label: 'Artists',
      value: stats.totalArtists.toLocaleString(),
      color: 'text-purple-400',
      bg: 'from-purple-500/20 to-pink-500/20',
    },
    {
      icon: Disc3,
      label: 'Daily Average',
      value: `${stats.averageDailyMinutes}m`,
      color: 'text-orange-400',
      bg: 'from-orange-500/20 to-red-500/20',
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: `${stats.currentStreak || 0} days`,
      color: 'text-red-400',
      bg: 'from-red-500/20 to-rose-500/20',
    },
    {
      icon: TrendingUp,
      label: 'Peak Hour',
      value: stats.peakHour || 'N/A',
      color: 'text-cyan-400',
      bg: 'from-cyan-500/20 to-teal-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.label}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 backdrop-blur-sm hover:border-green-500/30 transition-all group"
          >
            <CardContent className="p-4">
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${item.bg} mb-3`}>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{item.value}</p>
              <p className="text-xs text-gray-400">{item.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
