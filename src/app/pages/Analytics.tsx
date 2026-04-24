import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Clock, Music, Calendar, Award, Target, Zap, Users, Globe, Crown, Trophy, Star, Sparkles, Flame, Heart, Headphones } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { useId, useMemo } from 'react';

export function Analytics() {
  const reactId = useId();
  const uniqueId = useMemo(() => `${reactId}-${Math.random().toString(36).substr(2, 9)}`, [reactId]);
  const monthlyData = [
    { id: 'jan', month: 'Jan', minutes: 1842, tracks: 412 },
    { id: 'feb', month: 'Feb', minutes: 1956, tracks: 438 },
    { id: 'mar', month: 'Mar', minutes: 2134, tracks: 476 },
    { id: 'apr', month: 'Apr', minutes: 2298, tracks: 512 },
    { id: 'may', month: 'May', minutes: 2456, tracks: 548 },
    { id: 'jun', month: 'Jun', minutes: 2634, tracks: 587 },
  ];

  const hourlyData = [
    { id: 'h12am', hour: '12AM', plays: 12 },
    { id: 'h3am', hour: '3AM', plays: 5 },
    { id: 'h6am', hour: '6AM', plays: 18 },
    { id: 'h9am', hour: '9AM', plays: 45 },
    { id: 'h12pm', hour: '12PM', plays: 67 },
    { id: 'h3pm', hour: '3PM', plays: 89 },
    { id: 'h6pm', hour: '6PM', plays: 123 },
    { id: 'h9pm', hour: '9PM', plays: 145 },
  ];

  const musicTasteData = [
    { id: 'energy', category: 'Energy', value: 85 },
    { id: 'dance', category: 'Danceability', value: 72 },
    { id: 'acoustic', category: 'Acousticness', value: 45 },
    { id: 'valence', category: 'Valence', value: 68 },
    { id: 'popularity', category: 'Popularity', value: 78 },
  ];

  const topGenresTime = [
    { genre: 'Pop', hours: 142, percentage: 32, color: '#22c55e' },
    { genre: 'Hip Hop', hours: 106, percentage: 24, color: '#3b82f6' },
    { genre: 'Rock', hours: 80, percentage: 18, color: '#881337' },
    { genre: 'Electronic', hours: 62, percentage: 14, color: '#10b981' },
    { genre: 'Indie', hours: 53, percentage: 12, color: '#059669' },
    { genre: 'R&B', hours: 45, percentage: 10, color: '#1d4ed8' },
    { genre: 'Alternative', hours: 38, percentage: 9, color: '#9f1239' },
    { genre: 'Jazz', hours: 31, percentage: 7, color: '#16a34a' },
    { genre: 'Country', hours: 27, percentage: 6, color: '#2563eb' },
    { genre: 'Classical', hours: 22, percentage: 5, color: '#4338ca' },
  ];

  const achievements = [
    {
      id: 1,
      title: 'Early Bird',
      description: '100 songs before 8 AM',
      icon: '🌅',
      progress: 100,
      unlocked: true,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 2,
      title: 'Night Owl',
      description: '200 songs after midnight',
      icon: '🦉',
      progress: 100,
      unlocked: true,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      title: 'Diverse Listener',
      description: '50+ different genres',
      icon: '🎵',
      progress: 76,
      unlocked: false,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 4,
      title: 'Marathon',
      description: '10 hours in one day',
      icon: '🏃',
      progress: 85,
      unlocked: false,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 5,
      title: 'Globetrotter',
      description: 'Listened to artists from 30 countries',
      icon: '🌍',
      progress: 100,
      unlocked: true,
      color: 'from-teal-500 to-cyan-500'
    },
    {
      id: 6,
      title: 'Vintage Vibes',
      description: '500 songs from before 2000',
      icon: '📻',
      progress: 62,
      unlocked: false,
      color: 'from-amber-500 to-yellow-500'
    },
    {
      id: 7,
      title: 'Audiophile',
      description: '1000 unique albums played',
      icon: '💿',
      progress: 100,
      unlocked: true,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 8,
      title: 'Party Starter',
      description: 'Created 25 playlists',
      icon: '🎉',
      progress: 44,
      unlocked: false,
      color: 'from-rose-500 to-pink-500'
    },
  ];

  const stats = [
    {
      label: 'Total Listening Time',
      value: '487h',
      change: '+23%',
      trend: 'up',
      icon: Clock,
      color: 'from-green-500 to-blue-500',
      bgColor: 'from-green-500/20 to-blue-500/20'
    },
    {
      label: 'Tracks Played',
      value: '2,973',
      change: '+18%',
      trend: 'up',
      icon: Music,
      color: 'from-blue-500 to-green-600',
      bgColor: 'from-blue-500/20 to-green-600/20'
    },
    {
      label: 'Unique Artists',
      value: '312',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'from-green-600 to-emerald-600',
      bgColor: 'from-green-600/20 to-emerald-600/20'
    },
    {
      label: 'Top Genre',
      value: 'Pop',
      change: '32%',
      trend: 'same',
      icon: Globe,
      color: 'from-rose-900 to-rose-800',
      bgColor: 'from-rose-900/20 to-rose-800/20'
    },
  ];

  const milestones = [
    { id: 1, title: '1,000 Songs', date: 'Jan 15, 2026', completed: true },
    { id: 2, title: '100 Hours', date: 'Feb 3, 2026', completed: true },
    { id: 3, title: '2,000 Songs', date: 'Apr 22, 2026', completed: true },
    { id: 4, title: '300 Artists', date: 'Jun 8, 2026', completed: true },
    { id: 5, title: '5,000 Songs', date: 'Coming soon', completed: false },
  ];

  const yearlyHighlights = [
    { id: 1, title: 'Reached Top 1% of The Weeknd listeners', icon: Crown, color: 'from-yellow-500 to-orange-500', date: 'March 2026' },
    { id: 2, title: 'Discovered 150 new artists', icon: Sparkles, color: 'from-purple-500 to-pink-500', date: 'February 2026' },
    { id: 3, title: 'Created your most popular playlist', icon: Trophy, color: 'from-blue-500 to-cyan-500', date: 'January 2026', followers: '2.3K' },
  ];

  const listeningStreaks = [
    { days: 127, type: 'Current Streak', icon: Flame, active: true, description: 'Days in a row' },
    { days: 189, type: 'Longest Streak', icon: Star, active: false, description: 'Personal best' },
    { days: 45, type: 'Monthly Average', icon: Calendar, active: false, description: 'This year' },
  ];

  return (
    <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
          <h1 className="text-4xl font-bold text-white">Analytics</h1>
        </div>
        <p className="text-gray-400">Deep dive into your listening patterns and music preferences</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 overflow-hidden relative group hover:border-purple-500/30 transition-all">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgColor}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {stat.trend !== 'same' && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span>{stat.change}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Monthly Trends */}
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 animate-pulse" />
          
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <Calendar className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Monthly Trends</CardTitle>
                  <p className="text-sm text-gray-400 mt-1">Your listening journey over time</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">This Month</p>
                <p className="text-lg font-bold text-purple-400">+43.9h</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData} id={`monthly-chart-${uniqueId}`}>
                <defs>
                  <linearGradient id={`analyticsMonthlyGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop key={`analytics-monthly-stop1-${uniqueId}`} offset="0%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop key={`analytics-monthly-stop2-${uniqueId}`} offset="100%" stopColor="#ec4899" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} vertical={false} />
                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #a855f7',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Line type="monotone" dataKey="minutes" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            
            {/* Monthly Insights */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-purple-500/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  <p className="text-xs text-gray-400">Growth</p>
                </div>
                <p className="text-lg font-bold text-white">+43%</p>
                <p className="text-xs text-gray-500">vs last month</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-lg p-3 border border-pink-500/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Music className="h-4 w-4 text-pink-400" />
                  <p className="text-xs text-gray-400">Avg Daily</p>
                </div>
                <p className="text-lg font-bold text-white">87.8 min</p>
                <p className="text-xs text-gray-500">This month</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-purple-500/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="h-4 w-4 text-purple-400" />
                  <p className="text-xs text-gray-400">Best Month</p>
                </div>
                <p className="text-lg font-bold text-white">June</p>
                <p className="text-xs text-gray-500">2,634 minutes</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 animate-pulse" />
          
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Listening by Hour</CardTitle>
                  <p className="text-sm text-gray-400 mt-1">Peak activity times</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Peak Hour</p>
                <p className="text-lg font-bold text-blue-400">8-9 PM</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData} id={`hourly-chart-${uniqueId}`}>
                <defs>
                  <linearGradient id={`analyticsBarGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop key={`analytics-bar-stop1-${uniqueId}`} offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                    <stop key={`analytics-bar-stop2-${uniqueId}`} offset="100%" stopColor="#06b6d4" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} vertical={false} />
                <XAxis dataKey="hour" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis 
                  stroke="#9ca3af" 
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => value.toString()}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                  itemStyle={{ color: '#a78bfa' }}
                  cursor={false}
                />
                <Bar dataKey="plays" fill={`url(#analyticsBarGradient-${uniqueId})`} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Hour Insights Cards */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-3 border border-blue-500/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-blue-400" />
                  <p className="text-xs text-gray-400">Morning</p>
                </div>
                <p className="text-lg font-bold text-white">63 plays</p>
                <p className="text-xs text-gray-500">6AM - 12PM</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg p-3 border border-cyan-500/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-cyan-400" />
                  <p className="text-xs text-gray-400">Afternoon</p>
                </div>
                <p className="text-lg font-bold text-white">156 plays</p>
                <p className="text-xs text-gray-500">12PM - 6PM</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-purple-500/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="h-4 w-4 text-purple-400" />
                  <p className="text-xs text-gray-400">Evening</p>
                </div>
                <p className="text-lg font-bold text-white">268 plays</p>
                <p className="text-xs text-gray-500">6PM - 12AM</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Music Taste Profile & Genre Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Music Taste Radar */}
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 animate-pulse" />
          
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                <Target className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">Music Taste Profile</CardTitle>
                <p className="text-sm text-gray-400 mt-1">Your unique listening DNA</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={musicTasteData} id={`radar-chart-${uniqueId}`}>
                <defs>
                  <linearGradient id={`analyticsRadarGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop key={`analytics-radar-stop1-${uniqueId}`} offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop key={`analytics-radar-stop2-${uniqueId}`} offset="100%" stopColor="#059669" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="category" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <PolarRadiusAxis stroke="#9ca3af" />
                <Radar dataKey="value" stroke="#10b981" fill={`url(#analyticsRadarGradient-${uniqueId})`} fillOpacity={0.6} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
            
            {/* Taste Metrics */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {musicTasteData.slice(0, 4).map((item, index) => (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-3 border border-green-500/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400">{item.category}</p>
                    <span className="text-sm font-bold text-green-400">{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Genre Breakdown */}
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <Music className="h-5 w-5 text-pink-400" />
              </div>
              <CardTitle className="text-xl text-white">Top Genres by Time</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topGenresTime.map((genre, index) => (
                <div key={`genre-time-${genre.genre}-${index}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: genre.color }}></div>
                      <span className="text-sm font-medium text-white">{genre.genre}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-400">{genre.hours}h</span>
                      <span className="text-sm font-bold text-white w-12 text-right">{genre.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${genre.percentage * 3.125}%`,
                        backgroundColor: genre.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">Achievements</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 overflow-hidden relative ${
                achievement.unlocked ? 'border-purple-500/30' : ''
              }`}
            >
              <CardContent className="p-5">
                {achievement.unlocked && (
                  <div className="absolute top-2 right-2">
                    <Award className="h-5 w-5 text-yellow-400" fill="currentColor" />
                  </div>
                )}
                <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${achievement.color} p-0.5 mb-4 ${!achievement.unlocked && 'opacity-50'}`}>
                  <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center">
                    <span className="text-3xl">{achievement.icon}</span>
                  </div>
                </div>
                <h3 className="font-bold text-white mb-1">{achievement.title}</h3>
                <p className="text-xs text-gray-400 mb-3">{achievement.description}</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-purple-400 font-medium">{achievement.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${achievement.color} transition-all duration-500`}
                      style={{ width: `${achievement.progress}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-green-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">Milestones</h2>
        </div>

        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
          <CardContent className="p-6">
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative flex items-center gap-4">
                  {index !== milestones.length - 1 && (
                    <div className={`absolute left-[15px] top-[40px] w-px h-[calc(100%+16px)] ${milestone.completed ? 'bg-gradient-to-b from-purple-500 to-pink-500' : 'bg-gray-700'}`}></div>
                  )}
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 ${
                    milestone.completed
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : 'bg-gray-700'
                  }`}>
                    {milestone.completed ? (
                      <Award className="h-4 w-4 text-white" fill="white" />
                    ) : (
                      <div className="h-3 w-3 rounded-full bg-gray-900"></div>
                    )}
                  </div>
                  <div className="flex-1 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold ${milestone.completed ? 'text-white' : 'text-gray-500'}`}>
                        {milestone.title}
                      </h4>
                      <span className="text-sm text-gray-400">{milestone.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yearly Highlights */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-green-600 to-rose-900 rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">Yearly Highlights</h2>
        </div>

        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
          <CardContent className="p-6">
            <div className="space-y-4">
              {yearlyHighlights.map((highlight, index) => (
                <div key={highlight.id} className="relative flex items-center gap-4">
                  {index !== yearlyHighlights.length - 1 && (
                    <div className={`absolute left-[15px] top-[40px] w-px h-[calc(100%+16px)] ${highlight.color} bg-gradient-to-b`}></div>
                  )}
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 bg-gradient-to-br ${highlight.color}`}>
                    <highlight.icon className="h-4 w-4 text-white" fill="white" />
                  </div>
                  <div className="flex-1 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold ${highlight.color} text-white`}>
                        {highlight.title}
                      </h4>
                      <span className="text-sm text-gray-400">{highlight.date}</span>
                    </div>
                    {highlight.followers && (
                      <div className="mt-2">
                        <Badge className="bg-gray-800/30 border border-gray-700/30 text-gray-400">
                          {highlight.followers} followers
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listening Streaks */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-rose-900 to-rose-800 rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">Listening Streaks</h2>
        </div>

        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
          <CardContent className="p-6">
            <div className="space-y-4">
              {listeningStreaks.map((streak, index) => (
                <div key={streak.type} className="relative flex items-center gap-4">
                  {index !== listeningStreaks.length - 1 && (
                    <div className={`absolute left-[15px] top-[40px] w-px h-[calc(100%+16px)] ${streak.active ? 'bg-gradient-to-b from-purple-500 to-pink-500' : 'bg-gray-700'}`}></div>
                  )}
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 ${
                    streak.active
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : 'bg-gray-700'
                  }`}>
                    {streak.active ? (
                      <Award className="h-4 w-4 text-white" fill="white" />
                    ) : (
                      <div className="h-3 w-3 rounded-full bg-gray-900"></div>
                    )}
                  </div>
                  <div className="flex-1 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold ${streak.active ? 'text-white' : 'text-gray-500'}`}>
                        {streak.type}
                      </h4>
                      <span className="text-sm text-gray-400">{streak.days} {streak.description}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}