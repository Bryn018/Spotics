import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Clock, TrendingUp } from 'lucide-react';
import { useDashboardData } from '../context/DashboardContext';

export function ListeningChart() {
  const { data } = useDashboardData();
  const chart = data?.summary?.payload?.listeningChart ?? [];

  if (chart.length === 0) {
    return <EmptyState message="Listening chart will populate after we have enough tracks." />;
  }

  const totalMinutes = chart.reduce((sum, point) => sum + point.minutes, 0);
  const avgMinutes = totalMinutes / chart.length || 0;
  const peak = chart.reduce((max, point) => (point.minutes > max.minutes ? point : max), chart[0]);

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 via-gray-900/50 to-pink-900/20 border-purple-500/20 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
      <CardHeader className="relative z-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Clock className="h-5 w-5 text-purple-400" />
            </div>
            <CardTitle className="text-xl text-white">Listening Activity</CardTitle>
          </div>
          <p className="text-sm text-gray-400 mt-1">Minutes played across the week</p>
        </div>
        <div className="flex flex-col items-end text-sm">
          <span className="text-white font-semibold">{Math.round(avgMinutes)}m avg</span>
          <span className="text-green-400 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" /> Peak {peak.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chart}>
            <defs>
              <linearGradient id="listeningChartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#ec4899" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} vertical={false} />
            <XAxis dataKey="label" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} tickFormatter={(value) => `${value}m`} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #a855f7',
                borderRadius: '12px',
                color: '#fff',
              }}
              formatter={(value: number) => [`${value} minutes`, 'Listening time']}
            />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="#a855f7"
              strokeWidth={3}
              fill="url(#listeningChartGradient)"
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 border-dashed border-gray-800 text-center py-12">
      <CardContent>
        <p className="text-gray-400">{message}</p>
      </CardContent>
    </Card>
  );
}
