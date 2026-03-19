import { Card, CardContent } from './ui/card';
import { Clock, Music, Headphones, TrendingUp } from 'lucide-react';

export function StatsOverview() {
  const stats = [
    {
      icon: Clock,
      label: 'Total Listening Time',
      value: '187h 42m',
      change: '+12%',
      trend: 'up'
    },
    {
      icon: Music,
      label: 'Tracks Played',
      value: '2,847',
      change: '+23%',
      trend: 'up'
    },
    {
      icon: Headphones,
      label: 'Unique Artists',
      value: '312',
      change: '+8%',
      trend: 'up'
    },
    {
      icon: TrendingUp,
      label: 'Avg. Daily Mins',
      value: '156',
      change: '+5%',
      trend: 'up'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800 hover:border-purple-500/50 transition-colors">
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
