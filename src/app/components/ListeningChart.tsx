import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { ListeningChartPoint } from '../types';

export function ListeningChart({ chartData }: { chartData?: ListeningChartPoint[] }) {
  const data = chartData ?? [];
  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);
  const avgMinutes = Math.round(totalMinutes / (data.length || 1));
  const peakEntry = data.length > 0 ? data.reduce((max, d) => d.minutes > max.minutes ? d : max, data[0]) : { label: '—', minutes: 0 };

  return (
    <div className="rounded-2xl bg-[#121212] border border-white/[0.06] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Listening Activity</h3>
          <p className="text-gray-500 text-sm mt-0.5">Your listening time this week</p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full">
          <TrendingUp className="h-4 w-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">+12%</span>
        </div>
      </div>

      {data.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>No listening data yet. Start listening on Spotify!</p>
        </div>
      )}

      {data.length > 0 && (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#222" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="label" stroke="#666" style={{ fontSize: '12px' }} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" style={{ fontSize: '12px' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)'
                }}
                labelStyle={{ color: '#fff', fontWeight: 600 }}
                itemStyle={{ color: '#1DB954' }}
                cursor={{ fill: 'rgba(29, 185, 84, 0.1)' }}
                formatter={(value: number) => [`${Math.round(value)} min`, 'Listening Time']}
              />
              <Bar dataKey="minutes" fill="#1DB954" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-500 text-xs mb-1">Total</p>
                <p className="text-white font-semibold">{Math.round(totalMinutes)}m</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Average</p>
                <p className="text-white font-semibold">{avgMinutes}m</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Peak Day</p>
                <p className="text-white font-semibold">{peakEntry.label}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
