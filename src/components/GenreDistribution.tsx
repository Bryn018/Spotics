import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Globe } from 'lucide-react';
import type { GenreStat } from '../types';

interface GenreDistributionProps {
  items: GenreStat[];
}

export function GenreDistribution({ items }: GenreDistributionProps) {
  const data = items.filter(g => g.percentage > 0);

  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-md bg-purple-500/10 flex items-center justify-center">
          <Globe className="h-4 w-4 text-purple-400" />
        </div>
        <h3 className="text-lg font-bold text-white font-mono">Genre Distribution</h3>
      </div>
      <div className="h-64">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="percentage"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: number) => [`${value}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 font-mono text-sm">No genre data available</p>
          </div>
        )}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {data.map((genre, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: genre.color || '#6b7280' }} />
            <span className="text-gray-400 text-xs font-mono">{genre.name} ({genre.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
