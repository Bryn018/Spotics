import type { ReactNode } from 'react';
import { Loader2, RefreshCw, Sparkles, Music2, Headphones, Disc3, Award } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { TimeRangeSelector } from '../components/TimeRangeSelector';
import { useDashboardData } from '../context/DashboardContext';
import { formatDistanceToNow } from 'date-fns';

const timeframeLabels = {
  short_term: 'Last 4 weeks',
  medium_term: 'Last 6 months',
  long_term: 'All time',
} as const;

const formatDuration = (minutes?: number) => {
  if (!minutes) return '0m';
  if (minutes < 90) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
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

  const timeframeComparisons = (data?.summaries ?? []).map((item) => ({
    label: timeframeLabels[item.timeframe as keyof typeof timeframeLabels],
    minutes: item.totals.minutes,
    tracks: item.totals.tracks,
  }));

  const achievements = buildAchievements(stats, genres.length, topTracks.length, activities.length);

  const topTrack = topTracks[0];
  const topArtist = topArtists[0];
  const recentActivity = activities[0];

  return (
    <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px] space-y-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <p className="text-sm font-semibold text-purple-300 uppercase tracking-widest">Deep dive</p>
          </div>
          <h1 className="text-4xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-2">
            {`What defined your listening over ${timeframeLabel?.toLowerCase()}. Last refreshed ${summaryUpdatedAt}.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => refetch()} className="text-white border-gray-700">
            <RefreshCw className="mr-2 h-4 w-4" /> Reload data
          </Button>
          <Button onClick={() => sync()} disabled={syncing} className="bg-gradient-to-r from-purple-500 to-pink-500">
            {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Sync Spotify
          </Button>
        </div>
      </div>

      <div>
        <TimeRangeSelector />
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total listening time" value={formatDuration(stats?.totalMinutes)} helper="Minutes streamed" />
        <StatCard label="Tracks played" value={(stats?.totalTracks ?? 0).toLocaleString()} helper="Unique songs" />
        <StatCard label="Unique artists" value={(stats?.totalArtists ?? 0).toLocaleString()} helper="Voices on repeat" />
        <StatCard label="Listening score" value={(summary.payload?.listeningScore ?? 0).toFixed(1)} helper="Blend of time + variety" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 bg-gradient-to-br from-purple-900/20 via-gray-900/50 to-pink-900/20 border-purple-500/20">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-2xl">Listening activity</CardTitle>
              <p className="text-sm text-gray-400">Minutes streamed per day</p>
            </div>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-200 border border-purple-500/30">
              {chart.length} data points
            </Badge>
          </CardHeader>
          <CardContent className="h-[320px]">
            {chart.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart}>
                  <defs>
                    <linearGradient id="analyticsListeningGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} vertical={false} />
                  <XAxis dataKey="label" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} tickFormatter={(value) => `${value}m`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #a855f7', borderRadius: 12 }}
                    formatter={(value: number) => [`${value} minutes`, 'Streaming time']}
                  />
                  <Area type="monotone" dataKey="minutes" stroke="#a855f7" strokeWidth={3} fill="url(#analyticsListeningGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmptyState message="Listening trend chart will display after your next sync." />
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 border-gray-800/70">
          <CardHeader>
            <CardTitle className="text-white text-xl">Timeframe comparison</CardTitle>
            <p className="text-sm text-gray-400">Minutes vs tracks per period</p>
          </CardHeader>
          <CardContent className="h-[320px]">
            {timeframeComparisons.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeframeComparisons} layout="vertical" margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                  <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis type="category" dataKey="label" stroke="#9ca3af" width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #8b5cf6', borderRadius: 12 }}
                    formatter={(value: number, name: string) => [name === 'minutes' ? `${value} minutes` : `${value} tracks`, name]}
                  />
                  <Bar dataKey="minutes" fill="#a855f7" radius={[0, 6, 6, 0]} />
                  <Bar dataKey="tracks" fill="#ec4899" radius={[0, 6, 6, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmptyState message="We’ll show timeframe comparisons once multiple summaries exist." />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
          highlight={topArtist?.name ?? 'Pending' }
          subtitle={`${topArtist?.genres?.slice(0, 2).join(' · ') || 'Genres TBD'}`}
          meta={`${topArtist?.plays ?? 0} plays · ${topArtist ? `${topArtist.hours}h` : ''}`}
        />
        <InsightCard
          title="Latest activity"
          icon={<Disc3 className="h-5 w-5" />}
          highlight={recentActivity?.title ?? 'No recent plays'}
          subtitle={recentActivity?.subtitle ?? 'Sync to pull your timeline.'}
          meta=
            {recentActivity
              ? formatDistanceToNow(new Date(recentActivity.occurred_at), { addSuffix: true })
              : 'No timestamp yet'}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-xl">Genre distribution</CardTitle>
            <p className="text-sm text-gray-400">Share of time by genre</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {genres.length ? (
              genres.map((genre) => (
                <div key={genre.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-white font-medium">{genre.name}</p>
                    <p className="text-purple-300 font-semibold">{genre.percentage}%</p>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${Math.min(100, genre.percentage)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{genre.hours} listening hours</p>
                </div>
              ))
            ) : (
              <EmptyState message="We’ll highlight top genres once you stream more music." />
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-xl">Milestones & achievements</CardTitle>
            <p className="text-sm text-gray-400">Auto-unlocks as your stats climb</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="relative p-4 rounded-xl bg-black/40 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold">{achievement.title}</p>
                    <p className="text-xs text-gray-400">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && (
                    <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 flex items-center gap-1">
                      <Award className="h-3 w-3" /> Unlocked
                    </Badge>
                  )}
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${achievement.unlocked ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {achievement.currentLabel} · {achievement.progress}% complete
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/60">
      <CardContent className="p-6">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{helper}</p>
      </CardContent>
    </Card>
  );
}

function InsightCard({ title, icon, highlight, subtitle, meta }: { title: string; icon: React.ReactNode; highlight: string; subtitle: string; meta: string; }) {
  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
      <CardHeader className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-300">
          {icon}
        </div>
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

function buildAchievements(stats: { totalMinutes: number; totalTracks: number; totalArtists: number } | undefined, genreCount: number, trackCount: number, activityCount: number) {
  const minutes = stats?.totalMinutes ?? 0;
  const tracks = stats?.totalTracks ?? 0;
  const artists = stats?.totalArtists ?? 0;

  return [
    {
      id: 'minutes',
      title: 'Time Keeper',
      description: 'Stream 600+ minutes in this window',
      currentLabel: `${formatDuration(minutes)} listened`,
      progress: Math.min(100, Math.round((minutes / 600) * 100)),
      unlocked: minutes >= 600,
    },
    {
      id: 'tracks',
      title: 'Track Collector',
      description: 'Play 150 different songs',
      currentLabel: `${tracks} tracks`,
      progress: Math.min(100, Math.round((tracks / 150) * 100)),
      unlocked: tracks >= 150,
    },
    {
      id: 'genres',
      title: 'Genre Explorer',
      description: 'Log at least 8 genres',
      currentLabel: `${genreCount} genres`,
      progress: Math.min(100, Math.round((genreCount / 8) * 100)),
      unlocked: genreCount >= 8,
    },
    {
      id: 'activity',
      title: 'Timeline Keeper',
      description: 'Populate 20 recent activity events',
      currentLabel: `${activityCount} events`,
      progress: Math.min(100, Math.round((activityCount / 20) * 100)),
      unlocked: activityCount >= 20,
    },
  ];
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-gray-500">{message}</p>;
}

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="h-full flex items-center justify-center text-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
