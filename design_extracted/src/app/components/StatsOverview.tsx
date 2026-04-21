import { Card, CardContent } from './ui/card';
import { Clock, Music, Headphones, TrendingUp } from 'lucide-react';
import { useTimeRange } from '../contexts/TimeRangeContext';

export function StatsOverview() {
  const { timeRange } = useTimeRange();

  const statsData = {
    '4weeks': [
      {
        icon: Clock,
        label: 'Total Listening Time',
        value: '87h 32m',
        change: '+12%',
        trend: 'up'
      },
      {
        icon: Music,
        label: 'Tracks Played',
        value: '1,247',
        change: '+23%',
        trend: 'up'
      },
      {
        icon: Headphones,
        label: 'Unique Artists',
        value: '156',
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
    ],
    '6months': [
      {
        icon: Clock,
        label: 'Total Listening Time',
        value: '487h 12m',
        change: '+18%',
        trend: 'up'
      },
      {
        icon: Music,
        label: 'Tracks Played',
        value: '6,234',
        change: '+31%',
        trend: 'up'
      },
      {
        icon: Headphones,
        label: 'Unique Artists',
        value: '412',
        change: '+15%',
        trend: 'up'
      },
      {
        icon: TrendingUp,
        label: 'Avg. Daily Mins',
        value: '178',
        change: '+9%',
        trend: 'up'
      }
    ],
    'alltime': [
      {
        icon: Clock,
        label: 'Total Listening Time',
        value: '1,247h 56m',
        change: '+42%',
        trend: 'up'
      },
      {
        icon: Music,
        label: 'Tracks Played',
        value: '18,923',
        change: '+56%',
        trend: 'up'
      },
      {
        icon: Headphones,
        label: 'Unique Artists',
        value: '892',
        change: '+34%',
        trend: 'up'
      },
      {
        icon: TrendingUp,
        label: 'Avg. Daily Mins',
        value: '198',
        change: '+12%',
        trend: 'up'
      }
    ]
  };

  const stats = statsData[timeRange];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 light:from-white light:to-gray-50 border-gray-800 light:border-gray-200 hover:border-purple-500/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400 light:text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white light:text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-400 light:text-green-600 mt-2">{stat.change} from last month</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 light:bg-purple-500/10">
                <stat.icon className="h-6 w-6 text-purple-400 light:text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}