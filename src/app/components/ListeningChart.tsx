import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { ListeningChartPoint } from '../types';

interface ListeningChartProps {
  data: ListeningChartPoint[];
}

export function ListeningChart({ data }: ListeningChartProps) {
  const chartData = data.length > 0 ? data : [];

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
            <BarChart3 className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-white">Listening Activity</CardTitle>
            <p className="text-sm text-gray-400">Your listening patterns over time</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="listeningGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={false}
                  tickFormatter={(value) => `${value}m`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [`${value} minutes`, 'Listening Time']}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#listeningGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No listening data available for this timeframe</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
