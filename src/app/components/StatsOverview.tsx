import { Card, CardContent } from './ui/card';
import { Clock, Music, Headphones, TrendingUp } from 'lucide-react';
import { useTimeRange } from '../contexts/TimeRangeContext';
import type { DashboardPayload } from '../types';

const formatMinutes = (mins: number) => {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours}h ${minutes}m`;
};

export function StatsOverview({ stats }: { stats?: DashboardPayload['stats'] }) {
  const { timeRange } = useTimeRange();

  // Use real data if available, otherwise demo data
  const realStats = stats ? [
    {
      icon: Clock,
      label: 'Total Listening Time',
      value: formatMinutes(stats.totalMinutes),
      change: '+12%',
      trend: 'up'
    },
    {
      icon: Music,
      label: 'Tracks Played',
      value: (Number(stats.totalTracks) || 0).toLocaleString(),
      change: '+23%',
      trend: 'up'
    },
    {
      icon: Headphones,
      label: 'Unique Artists',
      value: String(Number(stats.totalArtists) || 0),
      change: '+8%',
      trend: 'up'
    },
    {
      icon: TrendingUp,
      label: 'Avg. Daily Mins',
      value: String(Number(stats.averageDailyMinutes) || 0),
      change: '+5%',
      trend: 'up'
    }
  ] : null;

  const demoStats = {
    '4weeks': [
      { icon: Clock, label: 'Total Listening Time', value: '87h 32m', change: '+12%', trend: 'up' },
      { icon: Music, label: 'Tracks Played', value: '1,247', change: '+23%', trend: 'up' },
      { icon: Headphones, label: 'Unique Artists', value: '156', change: '+8%', trend: 'up' },
      { icon: TrendingUp, label: 'Avg. Daily Mins', value: '156', change: '+5%', trend: 'up' }
    ],
    '6months': [
      { icon: Clock, label: 'Total Listening Time', value: '487h 12m', change: '+18%', trend: 'up' },
      { icon: Music, label: 'Tracks Played', value: '6,234', change: '+15%', trend: 'up' },
      { icon: Headphones, label: 'Unique Artists', value: '423', change: '+12%', trend: 'up' },
      { icon: TrendingUp, label: 'Avg. Daily Mins', value: '134', change: '+7%', trend: 'up' }
    ],
    alltime: [
      { icon: Clock, label: 'Total Listening Time', value: '1,247h', change: '+22%', trend: 'up' },
      { icon: Music, label: 'Tracks Played', value: '18,923', change: '+20%', trend: 'up' },
      { icon: Headphones, label: 'Unique Artists', value: '892', change: '+15%', trend: 'up' },
      { icon: TrendingUp, label: 'Avg. Daily Mins', value: '142', change: '+10%', trend: 'up' }
    ]
  };

  const statsToShow = realStats ?? (demoStats[timeRange as keyof typeof demoStats] || demoStats['4weeks']);

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statsToShow.map((stat, index) => (
          <Card key={index} className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 overflow-hidden relative group hover:border-green-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20">
                  <stat.icon className="h-6 w-6 text-green-400" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
