import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { TrendingUp, TrendingDown, Clock, Music, Calendar, Award, Target, Zap, Users, Globe, Crown, Trophy, Star, Sparkles, Flame, Heart, Headphones } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { motion } from "motion/react";
import { useId, useMemo } from "react";
import { useAnalyticsData } from "../context/DashboardContext";

export function Analytics() {
  const { data, isLoading, error } = useAnalyticsData();
  const reactId = useId();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">Error loading analytics data</p>
      </div>
    );
  }

  // Derive data from analyticsResponse
  // Build monthly trend from listeningChart points
  const monthlyData = (data.trends || []).map((point, idx) => ({
    id: `m${idx}`,
    month: point.label,
    minutes: point.minutes,
    tracks: 0, // unknown from trends
  }));

  // Use hourly distribution
  const hourlyData = (data.hourlyDistribution || []).map((h) => ({
    id: `h${h.hour}`,
    hour: h.hour,
    plays: h.plays,
  }));

  // Music taste from backend
  const musicTasteData = (data.musicTaste || []).map((m) => ({
    id: m.category.toLowerCase(),
    category: m.category,
    value: m.value,
  }));

  // Top genres with colors
  const genreColors = ['#10b981', '#3b82f6', '#881337', '#059669', '#1e40af', '#f59e0b', '#8b5cf6'];
  const topGenresTime = (data.topGenres || []).map((g, i) => ({
    genre: g.name,
    hours: g.hours,
    percentage: g.percentage,
    color: genreColors[i % genreColors.length],
  }));

  // Achievements from backend
  const achievements = (data.achievements || []).map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    icon: a.icon,
    progress: a.progress,
    unlocked: a.unlocked,
    color: a.color,
  }));

  // Stats from backend
  const statsCards = (data.stats || []).map((s) => ({
    label: s.label,
    value: s.value,
    change: s.change,
    trend: s.trend,
    icon: s.icon,
    color: s.color,
    bgColor: s.bgColor,
  }));

  const uniqueId = useMemo(() => `${reactId}-${Math.random().toString(36).substr(2, 9)}`, [reactId]);

  return (
    <main className="container mx-auto px-4 lg:px-6 py-10 max-w-[1600px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Analytics
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Deep dive into your listening habits
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => {
          const IconComponent = (() => {
            switch (stat.icon) {
              case 'Clock': return Clock;
              case 'Music': return Music;
              case 'Calendar': return Calendar;
              case 'Award': return Award;
              case 'Target': return Target;
              case 'Zap': return Zap;
              case 'Users': return Users;
              case 'Globe': return Globe;
              case 'Crown': return Crown;
              case 'Trophy': return Trophy;
              case 'Star': return Star;
              case 'Sparkles': return Sparkles;
              case 'Flame': return Flame;
              case 'Heart': return Heart;
              case 'Headphones': return Headphones;
              default: return TrendingUp;
            }
          })();
          return (
            <Card key={i} className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">{stat.label}</CardTitle>
                <IconComponent className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" /> {stat.change}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Listening over time */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Listening Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="minutes" stroke="#a855f7" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Hourly distribution */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            When You Listen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="hour" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="plays" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Two column layout for music taste and genres */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Music Taste Radar */}
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Your Music Taste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={musicTasteData}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: 'white', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'white' }} />
                  <Radar name="Taste" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Genres */}
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Top Genres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topGenresTime.map((genre, i) => (
                <div key={genre.genre} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: genre.color }}></span>
                      {genre.genre}
                    </span>
                    <span className="text-gray-400">{genre.hours}h ({genre.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${genre.percentage}%`, backgroundColor: genre.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      {(data.achievements?.length || 0) > 0 && (
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-4 rounded-xl border ${ach.unlocked ? 'border-white/20 bg-white/5' : 'border-white/5 bg-white/2 opacity-60'}`}
                >
                  <div className="text-2xl mb-2">{ach.icon}</div>
                  <h4 className="font-semibold text-white text-sm">{ach.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{ach.description}</p>
                  {ach.unlocked && (
                    <Badge className="mt-2 bg-green-600">Unlocked</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones & Highlights (if present) */}
      {(data.milestones?.length || 0) > 0 && (
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.milestones.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <h4 className="font-medium">{m.title}</h4>
                    <p className="text-sm text-gray-400">{m.date}</p>
                  </div>
                  {m.completed ? (
                    <Badge className="bg-green-600">Completed</Badge>
                  ) : (
                    <Badge variant="outline">Upcoming</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
