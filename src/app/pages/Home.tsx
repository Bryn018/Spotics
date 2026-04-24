import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { HeroSection } from '../components/HeroSection';
import { TopTracks } from '../components/TopTracks';
import { TopArtists } from '../components/TopArtists';
import { TopAlbums } from '../components/TopAlbums';
import { StatsOverview } from '../components/StatsOverview';
import { ListeningChart } from '../components/ListeningChart';
import { GenreDistribution } from '../components/GenreDistribution';
import { RecentActivity } from '../components/RecentActivity';
import { WrappedSelector } from '../components/WrappedSelector';
import { TimeRangeSelector } from '../components/TimeRangeSelector';
import { useDashboard, useSyncDashboard } from '../hooks/useDashboard';
import { useWrap } from '../hooks/useWrap';
import { useSession } from '../context/SessionContext';

export function Home() {
  const { user } = useSession();
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('short_term');

  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboard(timeRange);
  const syncDashboard = useSyncDashboard();
  const { data: dailyWrap } = useWrap('daily');
  const { data: weeklyWrap } = useWrap('weekly');
  const { data: yearlyWrap } = useWrap('yearly');

  // Background sync on mount to ensure fresh data (including images)
  useEffect(() => {
    syncDashboard.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTimeRangeChange = useCallback((range: 'short_term' | 'medium_term' | 'long_term') => {
    setTimeRange(range);
  }, []);

  const handleRefresh = () => {
    syncDashboard.mutate();
  };

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          <p className="text-gray-400">Loading your music data...</p>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-400 mb-2">Failed to load dashboard data</p>
          <p className="text-gray-500 text-sm">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const payload = dashboardData?.summary?.payload;
  const activities = dashboardData?.activities ?? [];

  return (
    <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
      {/* Wrapped Stories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <WrappedSelector
          dailyWrap={dailyWrap ?? null}
          weeklyWrap={weeklyWrap ?? null}
          yearlyWrap={yearlyWrap ?? null}
        />
      </motion.div>

      {/* Controls Row */}
      <div className="flex items-center justify-between mb-8">
        <TimeRangeSelector currentRange={timeRange} onChange={handleTimeRangeChange} />
        <button
          onClick={handleRefresh}
          disabled={syncDashboard.isPending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${syncDashboard.isPending ? 'animate-spin' : ''}`} />
          {syncDashboard.isPending ? 'Syncing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="mb-12">
        <StatsOverview stats={payload?.stats ?? null} />
      </div>

      {/* Top Albums Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">Top Albums</h2>
        </div>
        <TopAlbums albums={payload?.topAlbums ?? []} />
      </div>

      {/* Main Content Grid - Tracks/Artists + Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 mb-12">
        {/* Left Column - Tracks & Artists */}
        <div className="xl:col-span-8 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">Top Tracks</h2>
            </div>
            <TopTracks tracks={payload?.topTracks ?? []} />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">Top Artists</h2>
            </div>
            <TopArtists artists={payload?.topArtists ?? []} />
          </div>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="xl:col-span-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-rose-900 to-rose-800 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
          </div>
          <div className="xl:sticky xl:top-24">
            <RecentActivity activities={activities} />
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <ListeningChart data={payload?.listeningChart ?? []} />
          <GenreDistribution genres={payload?.genreDistribution ?? []} />
        </div>
      </div>
    </main>
  );
}
