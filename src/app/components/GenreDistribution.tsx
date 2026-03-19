import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Music, TrendingUp } from 'lucide-react';

export function GenreDistribution() {
  const data = [
    { name: 'Pop', value: 32, color: '#a855f7', plays: 2847 },
    { name: 'Hip Hop', value: 24, color: '#ec4899', plays: 2134 },
    { name: 'Rock', value: 18, color: '#8b5cf6', plays: 1598 },
    { name: 'Electronic', value: 14, color: '#d946ef', plays: 1245 },
    { name: 'Indie', value: 12, color: '#c026d3', plays: 1067 },
  ];

  const totalPlays = data.reduce((acc, genre) => acc + genre.plays, 0);
  const topGenre = data[0];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-purple-500/50 rounded-xl p-3 shadow-2xl">
          <p className="text-white font-semibold mb-1">{payload[0].name}</p>
          <p className="text-purple-400 text-sm">{payload[0].value}% of total</p>
          <p className="text-gray-400 text-xs mt-1">{payload[0].payload.plays} plays</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-to-br from-pink-900/20 via-gray-900/50 to-purple-900/20 border-pink-500/20 backdrop-blur-sm overflow-hidden relative">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 animate-pulse" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm">
                <Music className="h-5 w-5 text-pink-400" />
              </div>
              <CardTitle className="text-2xl text-white">Genre Distribution</CardTitle>
            </div>
            <p className="text-sm text-gray-400">Your most listened genres</p>
          </div>
        </div>

        {/* Top Genre Highlight */}
        <div className="mt-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">Top Genre</p>
              <p className="text-xl font-bold text-white">{topGenre.name}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-purple-400 text-sm font-medium mb-1">
                <TrendingUp className="h-4 w-4" />
                <span>{topGenre.value}%</span>
              </div>
              <p className="text-xs text-gray-500">{topGenre.plays} plays</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800/50">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <defs>
                {data.map((entry, index) => (
                  <filter key={`glow-${entry.name}`} id={`glow-${entry.name}`} height="300%" width="300%" x="-75%" y="-75%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                ))}
              </defs>
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
                    key={`cell-${entry.name}`} 
                    fill={entry.color}
                    stroke={entry.color}
                    strokeWidth={2}
                    filter={`url(#glow-${entry.name})`}
                    style={{ 
                      filter: 'drop-shadow(0px 0px 8px rgba(168, 85, 247, 0.4))',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Label */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-6">
            <p className="text-gray-400 text-xs">Total Plays</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {totalPlays.toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* Genre Legend with Stats */}
        <div className="mt-6 space-y-3">
          {data.map((genre, index) => (
            <div 
              key={`genre-legend-${genre.name}`} 
              className="group bg-gray-800/30 hover:bg-gray-800/50 rounded-lg p-3 border border-gray-700/30 hover:border-purple-500/30 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <div 
                      className="h-4 w-4 rounded-full ring-2 ring-gray-900 group-hover:scale-110 transition-transform" 
                      style={{ backgroundColor: genre.color }}
                    />
                    <div 
                      className="absolute inset-0 h-4 w-4 rounded-full animate-ping opacity-0 group-hover:opacity-75" 
                      style={{ backgroundColor: genre.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{genre.name}</span>
                      {index === 0 && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded text-xs text-purple-300">
                          Top
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-400">{genre.plays} plays</span>
                      <div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden max-w-[120px]">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${genre.value * 3.125}%`,
                            backgroundColor: genre.color
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-lg font-bold text-white">{genre.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}