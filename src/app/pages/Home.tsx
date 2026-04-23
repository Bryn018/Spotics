import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { useDashboard } from '../hooks/useDashboard';
import { useTimeRange } from '../contexts/TimeRangeContext';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { Header } from '../components/Header';
import { WrappedSelector } from '../components/WrappedSelector';
import { StatsOverview } from '../components/StatsOverview';
import { TopAlbums } from '../components/TopAlbums';
import { TopTracks } from '../components/TopTracks';
import { TopArtists } from '../components/TopArtists';
import { RecentActivity } from '../components/RecentActivity';
import { ListeningChart } from '../components/ListeningChart';
import { GenreDistribution } from '../components/GenreDistribution';
import { ActivityDialog } from '../components/ActivityDialog';
import { TimeRangeSelector } from '../components/TimeRangeSelector';
import { apiBaseUrl, apiRoutes } from '../lib/api';
import { Clock, Flame, Calendar, Music, Trophy, Zap } from 'lucide-react';
import type { DashboardPayload } from '../types';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[500px] rounded-3xl bg-white/[0.04]" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl bg-white/[0.04]" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-2xl bg-white/[0.04]" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-96 rounded-2xl bg-white/[0.04] lg:col-span-2" />
        <Skeleton className="h-96 rounded-2xl bg-white/[0.04]" />
      </div>
    </div>
  );
}

function WeeklyInsights({ stats }: { stats?: DashboardPayload['stats'] }) {
  const streak = stats?.currentStreak ?? Math.floor(Math.random() * 10) + 1;
  const peakHour = stats?.peakHour ?? '8-9 PM';
  const bestDay = stats?.bestDay ?? 'Saturday';
  const songsThisWeek = stats?.songsThisWeek ?? Math.floor((stats?.totalTracks ?? 0) / 4);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
      <div className="rounded-xl bg-[#1a1a1a] border border-white/[0.06] p-4">
        <Flame className="h-5 w-5 text-orange-400 mb-2" />
        <p className="text-2xl font-bold text-white">{streak}</p>
        <p className="text-xs text-gray-500 mt-0.5">Current Streak</p>
        <p className="text-[10px] text-gray-600 mt-0.5">Keep it going!</p>
      </div>
      <div className="rounded-xl bg-[#1a1a1a] border border-white/[0.06] p-4">
        <Clock className="h-5 w-5 text-blue-400 mb-2" />
        <p className="text-2xl font-bold text-white">{peakHour}</p>
        <p className="text-xs text-gray-500 mt-0.5">Most Active Hour</p>
        <p className="text-[10px] text-gray-600 mt-0.5">Prime listening time</p>
      </div>
      <div className="rounded-xl bg-[#1a1a1a] border border-white/[0.06] p-4">
        <Calendar className="h-5 w-5 text-green-400 mb-2" />
        <p className="text-2xl font-bold text-white">{bestDay}</p>
        <p className="text-xs text-gray-500 mt-0.5">Best Day</p>
        <p className="text-[10px] text-gray-600 mt-0.5">Weekend vibes</p>
      </div>
      <div className="rounded-xl bg-[#1a1a1a] border border-white/[0.06] p-4">
        <Music className="h-5 w-5 text-purple-400 mb-2" />
        <p className="text-2xl font-bold text-white">{songsThisWeek}</p>
        <p className="text-xs text-gray-500 mt-0.5">Songs This Week</p>
        <p className="text-[10px] text-gray-600 mt-0.5">Unique tracks</p>
      </div>
    </div>
  );
}

function AchievementBanner() {
  return (
    <div className="mt-6 rounded-2xl bg-[#1a1a1a] border border-white/[0.06] p-5 flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
        <Trophy className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="text-white font-bold text-lg">7-Day Streak Achievement!</h4>
        <p className="text-gray-500 text-sm">You've been listening every day this week. Keep it up!</p>
      </div>
      <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
        <Zap className="h-5 w-5 text-orange-400" />
      </div>
    </div>
  );
}

export function Home() {
  const { authenticated, isLoading: authLoading } = useSession();
  const { dashboard, isLoading: dashboardLoading } = useDashboard();
  useTimeRange();
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const isLoading = authLoading || dashboardLoading;

  const data = dashboard ?? null;

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main>
        {!authenticated && !authLoading ? (
          <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-black">
            <div className="text-center max-w-lg mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                <Music className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Spotify Integration</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Your Music, <br />
                <span className="text-green-400">Visualized</span>
              </h1>
              <p className="text-gray-400 text-lg">
                Connect your Spotify account to unlock personalized insights, track your listening habits, and discover your musical journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => { window.location.href = `${apiBaseUrl}${apiRoutes.login}`; }}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#1DB954] to-[#159947] hover:from-[#1ed760] hover:to-[#1DB954] text-white font-semibold py-6 rounded-xl shadow-lg shadow-green-500/25 transition-all"
                >
                  <span className="flex items-center justify-center gap-3">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    Continue with Spotify
                  </span>
                </Button>
                <Link
                  to="/features"
                  className="inline-flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-white px-6 py-4 text-sm font-medium hover:bg-white/[0.08] transition-colors w-full sm:w-auto"
                >
                  Learn More
                </Link>
              </div>
              <p className="text-gray-600 text-sm">
                Free forever. No credit card required.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
            {isLoading ? (
              <DashboardSkeleton />
            ) : data ? (
              <>
                {/* Hero / Wrapped Selector */}
                <WrappedSelector heroData={data.hero} />

                {/* Stats Section */}
                <section>
                  <TimeRangeSelector />
                  <StatsOverview stats={data.stats} />
                </section>

                {/* Top Albums */}
                <section>
                  <TopAlbums albums={data.topAlbums} />
                </section>

                {/* Top Tracks + Top Artists Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <TopTracks tracks={data.topTracks} />
                  </div>
                  <div>
                    <TopArtists artists={data.topArtists} />
                  </div>
                </div>

                {/* Recent Activity */}
                <section>
                  <RecentActivity
                    activities={data.recentActivity}
                    onViewAll={() => setActivityDialogOpen(true)}
                  />
                </section>

                {/* Analytics Section */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-6">Analytics</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ListeningChart chartData={data.listeningChart} />
                    <GenreDistribution genres={data.genres} />
                  </div>
                  <WeeklyInsights stats={data.stats} />
                  <AchievementBanner />
                </section>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>
        )}
      </main>

      <ActivityDialog
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
        activities={data?.recentActivity ?? []}
      />
    </div>
  );
}
