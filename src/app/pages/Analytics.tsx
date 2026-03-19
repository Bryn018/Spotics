import type { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  Award,
  Calendar,
  Clock,
  Disc3,
  Globe,
  Headphones,
  Music,
  Music2,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useDashboardData } from '../context/DashboardContext';
import { TimeRangeSelector } from '../components/TimeRangeSelector';
import { formatDistanceToNow } from 'date-fns';

const fallbackMonthly = [
  { label: 'Jan', minutes: 1800, tracks: 420 },
  { label: 'Feb', minutes: 1950, tracks: 438 },
  { label: 'Mar', minutes: 2130, tracks: 476 },
  { label: 'Apr', minutes: 2290, tracks: 512 },
  { label: 'May', minutes: 2450, tracks: 548 },
  { label: 'Jun', minutes: 2630, tracks: 587 },
];

const fallbackHourly = [
  { hour: '12AM', plays: 12 },
  { hour: '3AM', plays: 5 },
  { hour: '6AM', plays: 18 },
  { hour: '9AM', plays: 45 },
  { hour: '12PM', plays: 67 },
  { hour: '3PM', plays: 89 },
  { hour: '6PM', plays: 123 },
  { hour: '9PM', plays: 145 },
];

const fallbackTaste = [
  { category: 'Energy', value: 85 },
  { category: 'Danceability', value: 72 },
  { category: 'Acousticness', value: 45 },
  { category: 'Valence', value: 68 },
  { category: 'Popularity', value: 78 },
];

const timeframeLabels: Record<string, string> = {
  short_term: 'Last 4 weeks',
  medium_term: 'Last 6 months',
  long_term: 'All time',
};

export function Analytics() {
  const { data, timeframe, isLoading, isError, refetch, sync, syncing } = useDashboardData();
  const summary = data?.summary;
  const stats = summary?.payload?.stats;
  const chart = summary?.payload?.listeningChart ?? [];
  const genres = summary?.payload?.genreDistribution ?? [];
  const topTracks = summary?.payload?.topTracks ?? [];
  const topArtists = summary?.payload?.topArtists ?? [];
  const activities = data?.activities ?? [];

  if (isLoading && !data) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <Loader2 className="h-10 w-10 animate-spin text-purple-400 mb-4" />
        <p className="text-lg text-white font-semibold">Loading analytics…</p>
        <p className="text-sm text-gray-400">Crunching your listening history.</p>
      </main>
    );
  }

  if (isError || !summary) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 gap-4">
        <p className="text-2xl font-semibold text-white">We couldn’t load analytics.</p>
        <p className="text-gray-400 max-w-md">Refresh the page or trigger a data sync to try again.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" onClick={() => refetch()} className="text-white border-gray-700">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
          <Button onClick={() => sync()} className="bg-gradient-to-r from-purple-500 to-pink-500">
            <Sparkles className="mr-2 h-4 w-4" /> Sync Spotify
          </Button>
        </div>
      </main>
    );
  }

  const timeframeLabel = timeframeLabels[timeframe];
  const summaryUpdatedAt = summary.fetchedAt
    ? formatDistanceToNow(new Date(summary.fetchedAt), { addSuffix: true })
    : 'Never';

  const monthlyData = chart.length
    ? chart.map((point) => ({ label: point.label, minutes: point.minutes, tracks: Math.round(point.minutes / 4) }))
    : fallbackMonthly;

  const hourlyData = fallbackHourly;
  const musicTasteData = fallbackTaste;

  const statCards = buildStatCards(stats);
  const topGenreList = genres.length ? genres : buildFallbackGenres();
  const achievements = buildAchievements(stats, genres.length, activities.length);
  const milestones = buildMilestones();

  const topTrack = topTracks[0];
  const topArtist = topArtists[0];
  const recentActivity = activities[0];

  return (
    <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
          <h1 className="text-4xl font-bold text-white">Analytics</h1>
        </div>
        <p className="text-gray-400">Deep dive into your listening patterns and music preferences.</p>
        <p className="text-xs text-gray-500 mt-2">{timeframeLabel} · Refreshed {summaryUpdatedAt}</p>
      </div>

      <div className="mb-8">
        <TimeRangeSelector />
      </div>

      <div className="flex flex-wrap gap-3 justify-between mb-10">
        <Button variant="outline" onClick={() => refetch()} className="text-white border-gray-700">
          <RefreshCw className="mr-2 h-4 w-4" /> Reload data
        </Button>
        <Button onClick={() => sync()} disabled={syncing} className="bg-gradient-to-r from-purple-500 to-pink-500">
          {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Sync Spotify
        </Button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 overflow-hidden relative group hover:border-purple-500/30 transition-all"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgColor}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                {stat.trend !== 'same' && (
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {stat.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span>{stat.change}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
              <CardTitle className="text-xl text-white">Monthly Trends</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <defs>
                  <linearGradient id="analyticsMonthlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} vertical={false} />
                <XAxis dataKey="label" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #a855f7', borderRadius: 12, color: '#fff' }}
                />
                <Line type="monotone" dataKey="minutes" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <CardTitle className="text-xl text-white">Listening by Hour</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <defs>
                  <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} vertical={false} />
                <XAxis dataKey="hour" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #3b82f6', borderRadius: 12, color: '#fff' }}
                />
                <Bar dataKey="plays" fill="url(#hourlyGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                <Target className="h-5 w-5 text-green-400" />
              </div>
              <CardTitle className="text-xl text-white">Music Taste Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={musicTasteData}>
                <defs>
                  <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="category" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <PolarRadiusAxis stroke="#9ca3af" />
                <Radar dataKey="value" stroke="#10b981" fill="url(#radarGradient)" fillOpacity={0.6} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
              {topGenreList.slice(0, 5).map((genre, index) => (
                <div key={genre.name ?? index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: genre.color ?? '#a855f7' }} />
                      <span className="text-sm font-medium text-white">{genre.name}</span>
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
                        width: `${Math.min(100, genre.percentage)}%`,
                        backgroundColor: genre.color ?? '#a855f7',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-12">
        <InsightCard
          title="Top track"
          icon={<Music2 className="h-5 w-5" />}
          highlight={topTrack?.title ?? 'No data yet'}
          subtitle={topTrack?.artist ?? 'Play more music to unlock this.'}
          meta={`${topTrack?.plays ?? 0} plays`}
        />
        <InsightCard
          title="Top artist"
          icon={<Headphones className="h-5 w-5" />}
          highlight={topArtist?.name ?? 'Pending'}
          subtitle={(topArtist?.genres ?? []).slice(0, 2).join(' · ') || 'Genres TBD'}
          meta={`${topArtist?.plays ?? 0} plays · ${topArtist ? `${topArtist.hours}h` : ''}`}
        />
        <InsightCard
          title="Latest activity"
          icon={<Disc3 className="h-5 w-5" />}
          highlight={recentActivity?.title ?? 'No recent plays'}
          subtitle={recentActivity?.subtitle ?? 'Sync to pull your timeline.'}
          meta={
            recentActivity
              ? formatDistanceToNow(new Date(recentActivity.occurred_at), { addSuffix: true })
              : 'No timestamp yet'
          }
        />
      </section>

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
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
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
          <h2 className="text-2xl font-bold text-white">Milestones</h2>
        </div>
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
          <CardContent className="p-6">
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative flex items-center gap-4">
                  {index !== milestones.length - 1 && (
                    <div
                      className={`absolute left-[15px] top-[40px] w-px h-[calc(100%+16px)] ${
                        milestone.completed ? 'bg-gradient-to-b from-purple-500 to-pink-500' : 'bg-gray-700'
                      }`}
                    />
                  )}
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center z-10 ${
                      milestone.completed ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gray-700'
                    }`}
                  >
                    {milestone.completed ? (
                      <Award className="h-4 w-4 text-white" fill="white" />
                    ) : (
                      <div className="h-3 w-3 rounded-full bg-gray-900" />
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
      </section>
    </main>
  );
}

function buildStatCards(stats?: { totalMinutes: number; totalTracks: number; totalArtists: number; averageDailyMinutes: number }) {
  const totalMinutes = stats?.totalMinutes ?? 0;
  return [
    {
      label: 'Total Listening Time',
      value: formatHours(totalMinutes),
      change: '+23%',
      trend: 'up',
      icon: Clock,
      bgColor: 'from-purple-500/20 to-pink-500/20',
    },
    {
      label: 'Tracks Played',
      value: (stats?.totalTracks ?? 0).toLocaleString(),
      change: '+18%',
      trend: 'up',
      icon: Music,
      bgColor: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      label: 'Unique Artists',
      value: (stats?.totalArtists ?? 0).toLocaleString(),
      change: '+12%',
      trend: 'up',
      icon: Users,
      bgColor: 'from-green-500/20 to-emerald-500/20',
    },
    {
      label: 'Top Genre',
      value: 'Pop',
      change: '32%',
      trend: 'same',
      icon: Globe,
      bgColor: 'from-pink-500/20 to-purple-500/20',
    },
  ];
}

function buildAchievements(stats: { totalMinutes: number; totalTracks: number; totalArtists: number } | undefined, genreCount: number, activityCount: number) {
  const minutes = stats?.totalMinutes ?? 0;
  const tracks = stats?.totalTracks ?? 0;
  return [
    {
      id: 1,
      title: 'Early Bird',
      description: '100 songs before 8 AM',
      icon: '🌅',
      progress: 100,
      unlocked: true,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      id: 2,
      title: 'Night Owl',
      description: '200 songs after midnight',
      icon: '🦉',
      progress: Math.min(100, Math.round(tracks / 2)),
      unlocked: tracks > 200,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 3,
      title: 'Diverse Listener',
      description: '50+ different genres',
      icon: '🎵',
      progress: Math.min(100, Math.round((genreCount / 50) * 100)),
      unlocked: genreCount >= 50,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 4,
      title: 'Marathon',
      description: '10 hours in one day',
      icon: '🏃',
      progress: Math.min(100, Math.round((minutes / 600) * 100)),
      unlocked: minutes >= 600,
      color: 'from-green-500 to-emerald-500',
    },
  ];
}

function buildMilestones() {
  return [
    { id: 1, title: '1,000 Songs', date: 'Jan 15, 2026', completed: true },
    { id: 2, title: '100 Hours', date: 'Feb 3, 2026', completed: true },
    { id: 3, title: '2,000 Songs', date: 'Apr 22, 2026', completed: true },
    { id: 4, title: '300 Artists', date: 'Jun 8, 2026', completed: true },
    { id: 5, title: '5,000 Songs', date: 'Coming soon', completed: false },
  ];
}

function buildFallbackGenres() {
  return [
    { name: 'Pop', hours: 142, percentage: 32, color: '#a855f7' },
    { name: 'Hip Hop', hours: 106, percentage: 24, color: '#ec4899' },
    { name: 'Rock', hours: 80, percentage: 18, color: '#8b5cf6' },
    { name: 'Electronic', hours: 62, percentage: 14, color: '#d946ef' },
    { name: 'Indie', hours: 53, percentage: 12, color: '#c026d3' },
  ];
}

function formatHours(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  return hours ? `${hours}h ${remaining}m` : `${minutes}m`;
}

function InsightCard({ title, icon, highlight, subtitle, meta }: { title: string; icon: ReactNode; highlight: string; subtitle: string; meta: string }) {
  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
      <CardHeader className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-300">{icon}</div>
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-lg font-semibold text-white">{highlight}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-400 mb-2">{subtitle}</p>
        <p className="text-xs text-gray-500">{meta}</p>
      </CardContent>
    </Card>
  );
}
