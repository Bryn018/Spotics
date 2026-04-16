import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Flame, Zap, Calendar, Music2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useId, useMemo } from 'react';
import { useDashboardData } from '../context/DashboardContext';

export function ListeningChart() {
  const reactId = useId();
  const uniqueId = useMemo(() => `${reactId}-${Math.random().toString(36).substr(2, 9)}`, [reactId]);
  const { data: dashData } = useDashboardData();
  const chart = dashData?.summary?.payload?.listeningChart ?? [];

  if (chart.length === 0) {
    return <EmptyState message="Listening chart will populate after we have enough tracks." />;
  }

  const totalMinutes = chart.reduce((sum, point) => sum + point.minutes, 0);
  const avgMinutes = Math.round(totalMinutes / chart.length);
  const peakDay = chart.reduce((max, point) => (point.minutes > max.minutes ? point : max), chart[0]);
  const totalSongs = dashData?.summary?.payload?.stats?.totalTracks ?? 0;

  const insights = [
    {
      icon: Flame,
      label: 'Current Streak',
      value: `${chart.length} days`,
      description: 'Keep it going!',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-500/20 to-red-500/20',
    },
    {
      icon: Zap,
      label: 'Peak Session',
      value: `${peakDay.minutes}m`,
      description: `On ${peakDay.label}`,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-500/20 to-orange-500/20',
    },
    {
      icon: Calendar,
      label: 'Best Day',
      value: peakDay.label,
      description: 'Most active',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'from-emerald-500/20 to-teal-500/20',
    },
    {
      icon: Music2,
      label: 'Total Tracks',
      value: totalSongs.toLocaleString(),
      description: 'Unique plays',
      color: 'from-teal-500 to-emerald-500',
      bgColor: 'from-teal-500/20 to-emerald-500/20',
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-emerald-900/20 via-gray-900/50 to-teal-900/20 border-emerald-500/20 backdrop-blur-sm overflow-hidden relative">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 animate-pulse" />

      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm">
                <Clock className="h-5 w-5 text-emerald-400" />
              </div>
              <CardTitle className="text-2xl text-white">Listening Activity</CardTitle>
            </div>
            <p className="text-sm text-gray-400">Your listening time this week</p>
          </div>

          <div className="text-right space-y-1">
            <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              <span>Peak {peakDay.label}</span>
            </div>
            <p className="text-xs text-gray-500">{Math.round(avgMinutes)}m avg</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-1">Total</p>
            <p className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              {totalMinutes}m
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-1">Average</p>
            <p className="text-xl font-bold text-white">{avgMinutes}m</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
            <p className="text-xs text-gray-400 mb-1">Peak Day</p>
            <p className="text-xl font-bold text-emerald-400">{peakDay.label}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800/50">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chart} id={`listening-chart-${uniqueId}`}>
              <defs>
                <linearGradient id={`listeningChartGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop key="stop1" offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop key="stop2" offset="50%" stopColor="#14b8a6" stopOpacity={0.4} />
                  <stop key="stop3" offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
                <filter id={`listeningChartShadow-${uniqueId}`} height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                  <feOffset dx="0" dy="4" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode key="node1" />
                    <feMergeNode key="node2" in="SourceGraphic" />
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
                dataKey="label"
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
                  style: { fontSize: '12px', fontWeight: 500 },
                }}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #10b981',
                  borderRadius: '12px',
                  color: '#fff',
                  boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
                  padding: '12px',
                }}
                labelStyle={{ color: '#e5e7eb', fontWeight: 600, marginBottom: '4px' }}
                itemStyle={{ color: '#10b981', fontWeight: 500 }}
                cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '5 5' }}
                formatter={(value: number) => [`${value} minutes`, 'Listening time']}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#listeningChartGradient-${uniqueId})`}
                filter={`url(#listeningChartShadow-${uniqueId})`}
                dot={{
                  fill: '#10b981',
                  strokeWidth: 2,
                  stroke: '#fff',
                  r: 5,
                }}
                activeDot={{
                  r: 7,
                  fill: '#14b8a6',
                  stroke: '#fff',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Insights Grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Weekly Insights</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-4 border border-gray-700/30 hover:border-emerald-500/30 transition-all hover:scale-[1.02]"
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
                  <div className={`absolute -right-6 -bottom-6 h-24 w-24 bg-gradient-to-br ${insight.bgColor} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievement Badge - Streak */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-red-500/20 p-6 border-2 border-orange-500/40"
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
                ease: 'easeInOut',
              }}
              className="relative"
            >
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 p-1 shadow-2xl shadow-orange-500/50">
                <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center relative overflow-hidden">
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
                <h4 className="text-lg font-bold text-white">
                  {chart.length}-Day Streak Achievement!
                </h4>
              </div>
              <p className="text-sm text-gray-300 mb-3">
                You&apos;ve been consistent. Keep the momentum going!
              </p>

              {/* Streak Progress */}
              <div className="flex items-center gap-2">
                {chart.slice(0, 7).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1, type: 'spring' }}
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
                ease: 'easeInOut',
              }}
              className="hidden sm:flex flex-col items-center gap-2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-50" />
                <div className="relative px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-2 border-emerald-400/50 backdrop-blur-sm">
                  <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider mb-1">Bonus</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">+50 XP</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 border-dashed border-gray-800 text-center py-12">
      <CardContent>
        <p className="text-gray-400">{message}</p>
      </CardContent>
    </Card>
  );
}
