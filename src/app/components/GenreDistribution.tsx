import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Music } from 'lucide-react';
import type { GenreStat } from '../types';

interface GenreDistributionProps {
  genres: GenreStat[];
}

const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#ef4444', '#14b8a6', '#f59e0b', '#ec4899'];

export function GenreDistribution({ genres }: GenreDistributionProps) {
  const chartData = genres.length > 0 ? genres.map((g) => ({ name: g.name, value: g.percentage })) : [];
  const displayGenres = genres.length > 0 ? genres : [];

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
            <Music className="h-5 w-5 text-pink-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-white">Genre Distribution</CardTitle>
            <p className="text-sm text-gray-400">Your musical taste breakdown</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full mb-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Percentage']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No genre data available</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          {displayGenres.slice(0, 6).map((genre, index) => (
            <div key={genre.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-300">{genre.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${genre.percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-10 text-right">{genre.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
