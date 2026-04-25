import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Clock, Music, Calendar, Award, Target, Zap, Users, Globe, Crown, Trophy, Star, Sparkles, Flame, Heart, Headphones, Loader2 } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { useId, useMemo } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

const ICON_MAP: Record<string, React.ElementType> = {
  Clock,
  Music,
  Users,
  Globe,
  Crown,
  Sparkles,
  Trophy,
  Flame,
  Star,
  Calendar,
  Zap,
  Heart,
  Award,
  Target,
  Headphones,
};

const GENRE_COLORS = ['#1DB954', '#19E68C', '#1DB95499', '#19E68C99', '#1DB95477', '#19E68C77', '#1DB954', '#19E68C', '#1DB954', '#19E68C'];

function getIcon(name: string) {
  return ICON_MAP[name] ?? Music;
}

export function Analytics() {
  const reactId = useId();
  const uniqueId = useMemo(() => `${reactId}-${Math.random().toString(36).substr(2, 9)}`, [reactId]);
  const { data, isLoading } = useAnalytics();

  const stats = data?.stats ?? [];
  const trends = data?.trends ?? [];
  const hourlyData = data?.hourlyDistribution ?? [];
  const musicTasteData = data?.musicTaste ?? [];
  const topGenres = (data?.topGenres ?? []).map((g, i) => ({ ...g, color: GENRE_COLORS[i % GENRE_COLORS.length] }));
  const achievements = data?.achievements ?? [];
  const milestones = data?.milestones ?? [];
  const highlights = data?.highlights ?? [];
  const listeningStreaks = data?.streaks ?? [];

  const totalTrendMinutes = trends.reduce((sum, t) => sum + (t.minutes ?? 0), 0);
  const avgDaily = trends.length > 0 ? (totalTrendMinutes / trends.length).toFixed(1) : '0';
  const bestDay = trends.reduce((best, t) => (t.minutes > best.minutes ? t : best), trends[0] ?? { label: '-', minutes: 0 });

  const totalHourlyPlays = hourlyData.reduce((sum, h) => sum + h.plays, 0);
  const morningPlays = (hourlyData[2]?.plays ?? 0) + (hourlyData[3]?.plays ?? 0);
  const afternoonPlays = (hourlyData[4]?.plays ?? 0) + (hourlyData[5]?.plays ?? 0);
  const eveningPlays = (hourlyData[6]?.plays ?? 0) + (hourlyData[7]?.plays ?? 0);
  const peakHour = hourlyData.reduce((peak, h) => (h.plays > peak.plays ? h : peak), hourlyData[0] ?? { hour: '-', plays: 0 });

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 text-[#1DB954] animate-spin" />
          <span className="ml-3 text-[#B3B3B3]">Loading your analytics...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 w-12 bg-gradient-to-r from-[#1DB954] to-[#19E68C] rounded-full"></div>
          <h1 className="text-4xl font-bold text-white">Analytics</h1>
        </div>
        <p className="text-[#B3B3B3]">Deep dive into your listening patterns and music preferences</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {stats.map((stat, index) => {
          const Icon = getIcon(stat.icon);
          return (
            <Card key={index} className="bg-gradient-to-br from-[#111827]/50 to-[#1F2937]/50 border-[#1F2937]/50 overflow-hidden relative group hover:border-[#8B5CF6]/30 transition-all">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgColor}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {stat.trend !== 'same' && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-[#1DB954]' : 'text-red-400'}`}>
                      {stat.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span>{stat.change}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-[#B3B3B3] mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Weekly Trends */}
        <Card className="bg-gradient-to-br from-[#111827]/50 to-[#1F2937]/50 border-[#1F2937]/50 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 via-transparent to-[#EC4899]/5 animate-pulse" />
          
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20">
                  <Calendar className="h-5 w-5 text-[#A78BFA]" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Listening Trends</CardTitle>
                  <p className="text-sm text-[#B3B3B3] mt-1">Your listening over the last 7 days</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#B3B3B3]">Best Day</p>
                <p className="text-lg font-bold text-[#A78BFA]">{bestDay.label}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends} id={`monthly-chart-${uniqueId}`}>
                <defs>
                  <linearGradient id={`analyticsMonthlyGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop key={`analytics-monthly-stop1-${uniqueId}`} offset="0%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop key={`analytics-monthly-stop2-${uniqueId}`} offset="100%" stopColor="#ec4899" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} vertical={false} />
                <XAxis dataKey="label" stroke="#9ca3af" style={{ fontSize: '12px' }} />
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
            
            {/* Weekly Insights */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-[#8B5CF6]/10 to-[#EC4899]/10 rounded-lg p-3 border border-[#8B5CF6]/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-[#A78BFA]" />
                  <p className="text-xs text-[#B3B3B3]">Total</p>
                </div>
                <p className="text-lg font-bold text-white">{Math.round(totalTrendMinutes)}m</p>
                <p className="text-xs text-[#9CA3AF]">This week</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-[#EC4899]/10 to-[#8B5CF6]/10 rounded-lg p-3 border border-[#EC4899]/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Music className="h-4 w-4 text-[#F472B6]" />
                  <p className="text-xs text-[#B3B3B3]">Avg Daily</p>
                </div>
                <p className="text-lg font-bold text-white">{avgDaily} min</p>
                <p className="text-xs text-[#9CA3AF]">This week</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-[#8B5CF6]/10 to-[#EC4899]/10 rounded-lg p-3 border border-[#8B5CF6]/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="h-4 w-4 text-[#A78BFA]" />
                  <p className="text-xs text-[#B3B3B3]">Best Day</p>
                </div>
                <p className="text-lg font-bold text-white">{bestDay.label}</p>
                <p className="text-xs text-[#9CA3AF]">{Math.round(bestDay.minutes)} minutes</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card className="bg-gradient-to-br from-[#111827]/50 to-[#1F2937]/50 border-[#1F2937]/50 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 via-transparent to-[#06B6D4]/5 animate-pulse" />
          
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#3B82F6]/20 to-[#06B6D4]/20">
                  <Clock className="h-5 w-5 text-[#60A5FA]" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Listening by Hour</CardTitle>
                  <p className="text-sm text-[#B3B3B3] mt-1">Peak activity times</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#B3B3B3]">Peak Hour</p>
                <p className="text-lg font-bold text-[#60A5FA]">{peakHour.hour}</p>
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
                className="bg-gradient-to-br from-[#3B82F6]/10 to-[#06B6D4]/10 rounded-lg p-3 border border-[#3B82F6]/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-[#60A5FA]" />
                  <p className="text-xs text-[#B3B3B3]">Morning</p>
                </div>
                <p className="text-lg font-bold text-white">{morningPlays} plays</p>
                <p className="text-xs text-[#9CA3AF]">6AM - 12PM</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-[#06B6D4]/10 to-[#3B82F6]/10 rounded-lg p-3 border border-[#06B6D4]/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-[#22D3EE]" />
                  <p className="text-xs text-[#B3B3B3]">Afternoon</p>
                </div>
                <p className="text-lg font-bold text-white">{afternoonPlays} plays</p>
                <p className="text-xs text-[#9CA3AF]">12PM - 6PM</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-[#8B5CF6]/10 to-[#EC4899]/10 rounded-lg p-3 border border-[#8B5CF6]/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="h-4 w-4 text-[#A78BFA]" />
                  <p className="text-xs text-[#B3B3B3]">Evening</p>
                </div>
                <p className="text-lg font-bold text-white">{eveningPlays} plays</p>
                <p className="text-xs text-[#9CA3AF]">6PM - 12AM</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Music Taste Profile & Genre Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Music Taste Radar */}
        <Card className="bg-gradient-to-br from-[#111827]/50 to-[#1F2937]/50 border-[#1F2937]/50 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/5 via-transparent to-[#1DB954]/5 animate-pulse" />
          
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#1DB954]/20 to-[#1DB954]/20">
                <Target className="h-5 w-5 text-[#1DB954]" />
              </div>
              <div>
                <CardTitle className="text-xl text-white">Music Taste Profile</CardTitle>
                <p className="text-sm text-[#B3B3B3] mt-1">Your unique listening DNA</p>
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
                  className="bg-gradient-to-br from-[#1DB954]/10 to-[#1DB954]/10 rounded-lg p-3 border border-[#1DB954]/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[#B3B3B3]">{item.category}</p>
                    <span className="text-sm font-bold text-[#1DB954]">{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-[#1DB954] to-[#1DB954] rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Genre Breakdown */}
        <Card className="bg-gradient-to-br from-[#111827]/50 to-[#1F2937]/50 border-[#1F2937]/50 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#EC4899]/20 to-[#8B5CF6]/20">
                <Music className="h-5 w-5 text-[#F472B6]" />
              </div>
              <CardTitle className="text-xl text-white">Top Genres by Time</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topGenres.map((genre, index) => (
                <div key={`genre-time-${genre.name}-${index}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: genre.color }}></div>
                      <span className="text-sm font-medium text-white">{genre.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-[#B3B3B3]">{genre.hours}h</span>
                      <span className="text-sm font-bold text-white w-12 text-right">{genre.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
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
              {topGenres.length === 0 && (
                <p className="text-sm text-[#9CA3AF] text-center py-8">No genre data available yet. Start listening to build your profile!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-[#1DB954] to-[#3B82F6] rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">Achievements</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`bg-gradient-to-br from-[#111827]/50 to-[#1F2937]/50 border-[#1F2937]/50 overflow-hidden relative ${
                achievement.unlocked ? 'border-[#8B5CF6]/30' : ''
              }`}
            >
              <CardContent className="p-5">
                {achievement.unlocked && (
                  <div className="absolute top-2 right-2">
                    <Award className="h-5 w-5 text-[#1DB954]" fill="currentColor" />
                  </div>
                )}
                <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${achievement.color} p-0.5 mb-4 ${!achievement.unlocked && 'opacity-50'}`}>
                  <div className="h-full w-full rounded-full bg-[#111827] flex items-center justify-center">
                    <span className="text-3xl">{achievement.icon}</span>
                  </div>
                </div>
                <h3 className="font-bold text-white mb-1">{achievement.title}</h3>
                <p className="text-xs text-[#B3B3B3] mb-3">{achievement.description}</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#9CA3AF]">Progress</span>
                    <span className="text-[#A78BFA] font-medium">{achievement.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
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
          <div className="h-1 w-12 bg-gradient-to-r from-[#3B82F6] to-[#19E68C] rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">Milestones</h2>
        </div>

        <Card className="bg-gradient-to-br from-[#111827]/50 to-[#1F2937]/50 border-[#1F2937]/50 shadow-xl">
          <CardContent className="p-6">
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative flex items-center gap-4">
                  {index !== milestones.length - 1 && (
                    <div className={`absolute left-[15px] top-[40px] w-px h-[calc(100%+16px)] ${milestone.completed ? 'bg-gradient-to-b from-[#8B5CF6] to-[#EC4899]' : 'bg-[#374151]'}`}></div>
                  )}
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 ${
                    milestone.completed
                      ? 'bg-gradient-to-br from-[#8B5CF6] to-[#EC4899]'
                      : 'bg-[#374151]'
                  }`}>
                    {milestone.completed ? (
                      <Award className="h-4 w-4 text-white" fill="white" />
                    ) : (
                      <div className="h-3 w-3 rounded-full bg-[#111827]"></div>
                    )}
                  </div>
                  <div className="flex-1 p-3 rounded-lg bg-[#1F2937]/30 border border-[#374151]/30">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold ${milestone.completed ? 'text-white' : 'text-[#9CA3AF]'}`}>
                        {milestone.title}
                      </h4>
                      <span className="text-sm text-[#B3B3B3]">{milestone.date}</span>
                    </div>
                  </div>
                </div>
              ))}
              {milestones.length === 0 && (
                <p className="text-sm text-[#9CA3AF] text-center py-4">Keep listening to unlock milestones!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yearly Highlights */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-[#19E68C] to-[#7F1D1D] rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">Highlights</h2>
        </div>

        <Card className="bg-gradient-to-br from-[#111827]/50 to-[#1F2937]/50 border-[#1F2937]/50 shadow-xl">
          <CardContent className="p-6">
            <div className="space-y-4">
              {highlights.map((highlight, index) => {
                const Icon = getIcon(highlight.icon);
                return (
                  <div key={highlight.id} className="relative flex items-center gap-4">
                    {index !== highlights.length - 1 && (
                      <div className={`absolute left-[15px] top-[40px] w-px h-[calc(100%+16px)] bg-gradient-to-b ${highlight.color}`}></div>
                    )}
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 bg-gradient-to-br ${highlight.color}`}>
                      <Icon className="h-4 w-4 text-white" fill="white" />
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-[#1F2937]/30 border border-[#374151]/30">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white">
                          {highlight.title}
                        </h4>
                        <span className="text-sm text-[#B3B3B3]">{highlight.date}</span>
                      </div>
                      {highlight.followers && (
                        <div className="mt-2">
                          <Badge className="bg-[#1F2937]/30 border border-[#374151]/30 text-[#B3B3B3]">
                            {highlight.followers} followers
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {highlights.length === 0 && (
                <p className="text-sm text-[#9CA3AF] text-center py-4">Highlights will appear as you build your listening history.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listening Streaks */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-[#7F1D1D] to-[#881337] rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">Listening Streaks</h2>
        </div>

        <Card className="bg-gradient-to-br from-[#111827]/50 to-[#1F2937]/50 border-[#1F2937]/50 shadow-xl">
          <CardContent className="p-6">
            <div className="space-y-4">
              {listeningStreaks.map((streak, index) => {
                const Icon = getIcon(streak.icon);
                return (
                  <div key={streak.type} className="relative flex items-center gap-4">
                    {index !== listeningStreaks.length - 1 && (
                      <div className={`absolute left-[15px] top-[40px] w-px h-[calc(100%+16px)] ${streak.active ? 'bg-gradient-to-b from-[#8B5CF6] to-[#EC4899]' : 'bg-[#374151]'}`}></div>
                    )}
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 ${
                      streak.active
                        ? 'bg-gradient-to-br from-[#8B5CF6] to-[#EC4899]'
                        : 'bg-[#374151]'
                    }`}>
                      {streak.active ? (
                        <Award className="h-4 w-4 text-white" fill="white" />
                      ) : (
                        <Icon className="h-4 w-4 text-[#B3B3B3]" />
                      )}
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-[#1F2937]/30 border border-[#374151]/30">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold ${streak.active ? 'text-white' : 'text-[#9CA3AF]'}`}>
                          {streak.type}
                        </h4>
                        <span className="text-sm text-[#B3B3B3]">{streak.days} {streak.description}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
