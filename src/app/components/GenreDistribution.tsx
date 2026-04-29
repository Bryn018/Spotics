import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Music, TrendingUp, Headphones, Radio, Disc3, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { useId, useMemo } from 'react';

export function GenreDistribution() {
  const reactId = useId();
  const uniqueId = useMemo(() => `${reactId}-${Math.random().toString(36).substr(2, 9)}`, [reactId]);
  const data = [
    { id: 'pop', name: 'Pop', value: 32, color: '#9333ea', plays: 2847, gradient: 'from-purple-600/80 to-purple-700/80' },
    { id: 'hiphop', name: 'Hip Hop', value: 24, color: '#db2777', plays: 2134, gradient: 'from-pink-600/80 to-pink-700/80' },
    { id: 'rock', name: 'Rock', value: 18, color: '#7c3aed', plays: 1598, gradient: 'from-violet-600/80 to-violet-700/80' },
    { id: 'electronic', name: 'Electronic', value: 14, color: '#c026d3', plays: 1245, gradient: 'from-fuchsia-600/80 to-fuchsia-700/80' },
    { id: 'indie', name: 'Indie', value: 12, color: '#a855f7', plays: 1067, gradient: 'from-purple-700/80 to-purple-800/80' },
  ];

  const totalPlays = data.reduce((acc, genre) => acc + genre.plays, 0);
  const topGenre = data[0];

  const genreIcons = [Headphones, Radio, Disc3, Music, TrendingUp];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 light:bg-white border border-purple-500/50 light:border-purple-300 rounded-xl p-4 shadow-2xl"
        >
          <p className="text-white light:text-gray-900 font-semibold mb-2 text-lg">{payload[0].name}</p>
          <div className="space-y-1">
            <p className="text-purple-400 light:text-purple-600 text-sm font-medium">{payload[0].value}% of total</p>
            <p className="text-gray-400 light:text-gray-600 text-sm">{payload[0].payload.plays.toLocaleString()} plays</p>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 light:from-purple-50 light:via-white light:to-pink-50 border-gray-800/50 light:border-purple-200 backdrop-blur-sm overflow-hidden relative">
      {/* Subtle background glow - less vibrant */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-transparent to-pink-500/3" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/15 to-pink-500/15 light:from-pink-500/10 light:to-purple-500/10 backdrop-blur-sm">
                <Music className="h-5 w-5 text-purple-400 light:text-pink-600" />
              </div>
              <CardTitle className="text-2xl text-white light:text-gray-900">Genre Distribution</CardTitle>
            </div>
            <p className="text-sm text-gray-400 light:text-gray-600">Your most listened genres</p>
          </div>
        </div>

        {/* Top Genre Highlight */}
        <div className="mt-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 light:from-purple-500/5 light:to-pink-500/5 rounded-xl p-4 border border-purple-500/20 light:border-purple-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 light:text-gray-600 mb-1">Top Genre</p>
              <p className="text-xl font-bold text-white light:text-gray-900">{topGenre.name}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-purple-400 light:text-purple-600 text-sm font-medium mb-1">
                <TrendingUp className="h-4 w-4" />
                <span>{topGenre.value}%</span>
              </div>
              <p className="text-xs text-gray-500">{topGenre.plays.toLocaleString()} plays</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        {/* Circular Chart */}
        <div className="bg-gray-800/30 light:bg-white rounded-xl p-6 border border-gray-700/30 light:border-gray-200">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart id={`genre-pie-chart-${uniqueId}`}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent, cx, cy, midAngle, outerRadius }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 25;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  
                  return (
                    <text 
                      x={x} 
                      y={y} 
                      fill="white" 
                      className="light:fill-gray-900"
                      textAnchor={x > cx ? 'start' : 'end'} 
                      dominantBaseline="central"
                      style={{ fontSize: '13px', fontWeight: 600 }}
                    >
                      {`${name} ${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {data.map((entry) => (
                  <Cell
                    key={`cell-${entry.id}`}
                    fill={entry.color}
                    stroke={entry.color}
                    strokeWidth={1}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: 0.9
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Label */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-6">
            <p className="text-gray-400 light:text-gray-600 text-xs">Total Plays</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 light:from-purple-600 light:to-pink-600 bg-clip-text text-transparent">
              {totalPlays.toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* Alternative Visualization: Horizontal Bar Chart Design */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/15 to-pink-500/15">
              <BarChart3 className="h-4 w-4 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-white light:text-gray-900">Genre Breakdown</h3>
          </div>
          
          <div className="space-y-3">
            {data.map((genre, index) => {
              const Icon = genreIcons[index];
              return (
                <motion.div
                  key={`genre-bar-${genre.name}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-8 w-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: genre.color + '25' }}
                      >
                        <Icon className="h-4 w-4" style={{ color: genre.color }} />
                      </div>
                      <span className="text-sm font-medium text-white light:text-gray-900">{genre.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 light:text-gray-600">{genre.plays.toLocaleString()} plays</span>
                      <span className="text-sm font-bold text-white light:text-gray-900 w-12 text-right">{genre.value}%</span>
                    </div>
                  </div>
                  
                  {/* Horizontal Bar */}
                  <div className="h-2.5 bg-gray-700/30 light:bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${genre.value * 3.125}%` }}
                      transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                      className="h-full rounded-full relative"
                      style={{ backgroundColor: genre.color }}
                    >
                      {/* Subtle shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" 
                           style={{ 
                             animation: 'shimmer 2s infinite',
                             animationDelay: `${index * 0.2}s`
                           }} 
                      />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}