import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Flame, Zap, Calendar, Music2 } from 'lucide-react';

export function ListeningChart() {
  const data = [
    { date: 'Mon', minutes: 142 },
    { date: 'Tue', minutes: 178 },
    { date: 'Wed', minutes: 156 },
    { date: 'Thu', minutes: 189 },
    { date: 'Fri', minutes: 234 },
    { date: 'Sat', minutes: 267 },
    { date: 'Sun', minutes: 198 },
  ];

  const totalMinutes = data.reduce((acc, day) => acc + day.minutes, 0);
  const avgMinutes = Math.round(totalMinutes / data.length);
  const peakDay = data.reduce((max, day) => day.minutes > max.minutes ? day : max);

  const insights = [
    {
      icon: Flame,
      label: 'Current Streak',
      value: '7 days',
      description: 'Keep it going!',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-500/20 to-red-500/20',
    },
    {
      icon: Zap,
      label: 'Most Active Hour',
      value: '8-9 PM',
      description: 'Prime listening time',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-500/20 to-orange-500/20',
    },
    {
      icon: Calendar,
      label: 'Best Day',
      value: 'Saturday',
      description: 'Weekend vibes',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-500/20 to-pink-500/20',
    },
    {
      icon: Music2,
      label: 'Songs This Week',
      value: '156',
      description: 'Unique tracks',
      color: 'from-pink-500 to-purple-500',
      bgColor: 'from-pink-500/20 to-purple-500/20',
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 via-gray-900/50 to-pink-900/20 border-purple-500/20 backdrop-blur-sm overflow-hidden relative">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 animate-pulse" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
                <Clock className="h-5 w-5 text-purple-400" />
              </div>
              <CardTitle className="text-2xl text-white">Listening Activity</CardTitle>
            </div>
            <p className="text-sm text-gray-400">Your listening time this week</p>
          </div>
          
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              <span>+12%</span>
            </div>
            <p className="text-xs text-gray-500">vs last week</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-1">Total</p>
            <p className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {totalMinutes}m
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-1">Average</p>
            <p className="text-xl font-bold text-white">{avgMinutes}m</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-1">Peak Day</p>
            <p className="text-xl font-bold text-purple-400">{peakDay.date}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-6">
        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800/50">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="listeningChartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9}/>
                  <stop offset="50%" stopColor="#ec4899" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
                <filter id="listeningChartShadow" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                  <feOffset dx="0" dy="4" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#374151" 
                strokeOpacity={0.3}
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                style={{ fontSize: '13px', fontWeight: 500 }}
                axisLine={{ stroke: '#4b5563' }}
                tickLine={{ stroke: '#4b5563' }}
                dy={10}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                axisLine={{ stroke: '#4b5563' }}
                tickLine={{ stroke: '#4b5563' }}
                label={{ 
                  value: 'Minutes', 
                  angle: -90, 
                  position: 'insideLeft', 
                  fill: '#9ca3af',
                  style: { fontSize: '12px', fontWeight: 500 }
                }}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #a855f7',
                  borderRadius: '12px',
                  color: '#fff',
                  boxShadow: '0 10px 40px rgba(168, 85, 247, 0.3)',
                  padding: '12px'
                }}
                labelStyle={{ color: '#e5e7eb', fontWeight: 600, marginBottom: '4px' }}
                itemStyle={{ color: '#a855f7', fontWeight: 500 }}
                cursor={{ stroke: '#a855f7', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              <Area 
                type="monotone" 
                dataKey="minutes" 
                stroke="url(#listeningChartGradient)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#listeningChartGradient)"
                filter="url(#listeningChartShadow)"
                dot={{ 
                  fill: '#a855f7', 
                  strokeWidth: 2, 
                  stroke: '#fff', 
                  r: 5,
                  filter: 'url(#listeningChartShadow)'
                }}
                activeDot={{ 
                  r: 7, 
                  fill: '#ec4899',
                  stroke: '#fff',
                  strokeWidth: 2,
                  filter: 'url(#listeningChartShadow)'
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Insights Grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Weekly Insights</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-4 border border-gray-700/30 hover:border-purple-500/30 transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${insight.bgColor} backdrop-blur-sm ring-1 ring-white/10`}>
                      <Icon className={`h-5 w-5 bg-gradient-to-br ${insight.color} bg-clip-text text-transparent`} style={{ fill: 'currentColor', opacity: 0.9 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">{insight.label}</p>
                      <p className="text-xl font-bold text-white mb-0.5">{insight.value}</p>
                      <p className="text-xs text-gray-400">{insight.description}</p>
                    </div>
                  </div>
                  
                  {/* Decorative gradient */}
                  <div className={`absolute -right-6 -bottom-6 h-24 w-24 bg-gradient-to-br ${insight.bgColor} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievement Badge */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 p-4 border border-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 animate-pulse"></div>
          <div className="relative flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-0.5 shadow-xl">
              <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white mb-1">7-Day Streak Achievement!</h4>
              <p className="text-xs text-gray-400">You've been consistent all week. Keep the momentum going!</p>
            </div>
            <div className="hidden sm:block">
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <span className="text-xs font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">+50 XP</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}