import type { ParsedData } from '../context/DataContext';
import { Clock, Music, Users, Flame, TrendingUp, Calendar, Headphones, Zap } from 'lucide-react';

interface StatsOverviewProps {
  data: ParsedData;
}

export function StatsOverview({ data }: StatsOverviewProps) {
  const hours = Math.floor(data.totalMinutes / 60);
  const mins = data.totalMinutes % 60;

  const stats = [
    { icon: Clock, label: 'Total Time', value: `${hours}h ${mins}m`, color: 'text-green-400', bg: 'bg-green-500/10' },
    { icon: Music, label: 'Tracks Played', value: data.totalTracks.toLocaleString(), color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Users, label: 'Unique Artists', value: data.totalArtists.toLocaleString(), color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: Headphones, label: 'Albums', value: data.totalAlbums.toLocaleString(), color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { icon: Flame, label: 'Current Streak', value: `${data.currentStreak} days`, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { icon: TrendingUp, label: 'Avg Daily', value: `${data.averageDailyMinutes} min`, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { icon: Calendar, label: 'Peak Hour', value: data.peakHour, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { icon: Zap, label: 'Listening Score', value: `${data.listeningScore}/100`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-8 w-8 rounded-md ${stat.bg} flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <span className="text-gray-400 font-mono text-xs">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-white font-mono">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}
