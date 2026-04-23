import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { ListeningChartPoint } from '../types';

export function ListeningChart({ chartData }: { chartData?: ListeningChartPoint[] }) {
  const data = chartData ?? [];
  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);
  const avgMinutes = Math.round(totalMinutes / data.length);
  const peakEntry = data.reduce((max, d) => d.minutes > max.minutes ? d : max, data[0]);

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-white">Listening Activity</CardTitle>
            <p className="text-gray-400 text-sm mt-1">Your listening time this period</p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">+12%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p>No listening data yet. Start listening on Spotify!</p>
          </div>
        )}
        {data.length > 0 && (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} vertical={false} />
            <XAxis dataKey="label" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}
              labelStyle={{ color: '#f3f4f6' }}
              itemStyle={{ color: '#a78bfa' }}
              cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
            />
            <Bar dataKey="minutes" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
        )}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-xs">Total</p>
              <p className="text-white font-semibold">{totalMinutes}m</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Average</p>
              <p className="text-white font-semibold">{avgMinutes}m</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Peak Day</p>
              <p className="text-white font-semibold">{peakEntry.label}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
