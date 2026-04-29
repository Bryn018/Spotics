import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Flame, Zap, Calendar, Music2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useId, useMemo } from 'react';

export function ListeningChart() {
  const reactId = useId();
  const uniqueId = useMemo(() => `${reactId}-${Math.random().toString(36).substr(2, 9)}`, [reactId]);
  const data = [
    { id: 'mon', date: 'Mon', minutes: 142, songs: 32 },
    { id: 'tue', date: 'Tue', minutes: 178, songs: 41 },
    { id: 'wed', date: 'Wed', minutes: 156, songs: 36 },
    { id: 'thu', date: 'Thu', minutes: 189, songs: 43 },
    { id: 'fri', date: 'Fri', minutes: 234, songs: 54 },
    { id: 'sat', date: 'Sat', minutes: 267, songs: 61 },
    { id: 'sun', date: 'Sun', minutes: 198, songs: 45 },
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
            <AreaChart data={data} id={`listening-chart-${uniqueId}`}>
              <defs>
                <linearGradient id={`listeningChartGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop key={`listening-stop1-${uniqueId}`} offset="0%" stopColor="#a855f7" stopOpacity={0.9}/>
                  <stop key={`listening-stop2-${uniqueId}`} offset="50%" stopColor="#ec4899" stopOpacity={0.4}/>
                  <stop key={`listening-stop3-${uniqueId}`} offset="100%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
                <filter id={`listeningChartShadow-${uniqueId}`} height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                  <feOffset dx="0" dy="4" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode key={`listening-node1-${uniqueId}`}/>
                    <feMergeNode key={`listening-node2-${uniqueId}`} in="SourceGraphic"/>
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
                stroke={`url(#listeningChartGradient-${uniqueId})`}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#listeningChartGradient-${uniqueId})`}
                filter={`url(#listeningChartShadow-${uniqueId})`}
                dot={{
                  fill: '#a855f7',
                  strokeWidth: 2,
                  stroke: '#fff',
                  r: 5,
                  filter: `url(#listeningChartShadow-${uniqueId})`
                }}
                activeDot={{
                  r: 7,
                  fill: '#ec4899',
                  stroke: '#fff',
                  strokeWidth: 2,
                  filter: `url(#listeningChartShadow-${uniqueId})`
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

        {/* Achievement Badge - Animated 7-Day Streak */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-red-500/20 light:from-orange-500/10 light:via-yellow-500/10 light:to-red-500/10 p-6 border-2 border-orange-500/40 light:border-orange-400"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-2 w-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                animate={{
                  x: [Math.random() * 400, Math.random() * 400],
                  y: [Math.random() * 100, Math.random() * 100],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [0.5, 1.2, 0.5],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative flex items-center gap-5">
            {/* Animated Fire Icon */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 p-1 shadow-2xl shadow-orange-500/50">
                <div className="h-full w-full rounded-full bg-gray-900 light:bg-white flex items-center justify-center relative overflow-hidden">
                  {/* Glow effect inside */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-orange-500/30 to-transparent"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-4xl relative z-10">🔥</span>
                </div>
              </div>
              
              {/* Floating streak indicators */}
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-400"
                  initial={{ scale: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    y: [-20, -40],
                    x: [0, (i - 3) * 5],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                </motion.div>
                <h4 className="text-lg font-bold text-white light:text-gray-900">
                  7-Day Streak Achievement!
                </h4>
              </div>
              <p className="text-sm text-gray-300 light:text-gray-600 mb-3">
                You've been consistent all week. Keep the momentum going!
              </p>
              
              {/* Streak Progress */}
              <div className="flex items-center gap-2">
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1, type: "spring" }}
                    className="h-2 flex-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/30"
                  />
                ))}
              </div>
            </div>

            {/* XP Badge */}
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="hidden sm:flex flex-col items-center gap-2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 light:from-purple-500/20 light:to-pink-500/20 border-2 border-purple-400/50 light:border-purple-400 backdrop-blur-sm">
                  <p className="text-xs text-purple-300 light:text-purple-600 font-bold uppercase tracking-wider mb-1">Bonus</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 light:from-purple-600 light:to-pink-600 bg-clip-text text-transparent">+50 XP</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}