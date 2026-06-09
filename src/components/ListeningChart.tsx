import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { ListeningChartPoint } from '../types';

interface ListeningChartProps {
  data: ListeningChartPoint[];
}

export function ListeningChart({ data }: ListeningChartProps) {
  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-md bg-cyan-500/10 flex items-center justify-center">
          <BarChart3 className="h-4 w-4 text-cyan-400" />
        </div>
        <h3 className="text-lg font-bold text-white font-mono">Last 7 Days</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="label" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#10b981' }}
            />
            <Bar dataKey="minutes" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
