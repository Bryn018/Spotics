import { Clock, Headphones, Music, TrendingUp } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { useDashboardData } from '../context/DashboardContext';
import { motion } from 'motion/react';

export function StatsOverview() {
  const { data } = useDashboardData();
  const payload = data?.summary?.payload;

  const stats = [
    {
      icon: Clock,
      label: 'Total Listening Time',
      value: formatDuration(payload?.stats.totalMinutes ?? 0),
      change: '+12%',
    },
    {
      icon: Music,
      label: 'Tracks Played',
      value: (payload?.stats.totalTracks ?? 0).toLocaleString(),
      change: '+23%',
    },
    {
      icon: Headphones,
      label: 'Unique Artists',
      value: (payload?.stats.totalArtists ?? 0).toLocaleString(),
      change: '+8%',
    },
    {
      icon: TrendingUp,
      label: 'Avg. Daily Mins',
      value: Math.round(payload?.stats.averageDailyMinutes ?? 0).toString(),
      change: '+5%',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800 hover:border-emerald-500/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-green-400 mt-2">{stat.change} from last month</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                  <stat.icon className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}
