import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
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
import { useDashboard } from '../hooks/useDashboard';
import { useWrap } from '../hooks/useWrap';
import { useSession } from '../context/SessionContext';

export function Home() {
  const { user } = useSession();
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('short_term');

  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useDashboard(timeRange);
  const { data: dailyWrap } = useWrap('daily');
  const { data: weeklyWrap } = useWrap('weekly');
  const { data: yearlyWrap } = useWrap('yearly');

  const handleTimeRangeChange = useCallback((range: 'short_term' | 'medium_term' | 'long_term') => {
    setTimeRange(range);
  }, []);

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
    <div className="space-y-8">
      <TimeRangeSelector currentRange={timeRange} onChange={handleTimeRangeChange} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <WrappedSelector
          dailyWrap={dailyWrap ?? null}
          weeklyWrap={weeklyWrap ?? null}
          yearlyWrap={yearlyWrap ?? null}
        />
      </motion.div>

      <HeroSection
        totalTracks={payload?.hero.totalTracks ?? 0}
        totalArtists={payload?.hero.totalArtists ?? 0}
        totalMinutes={payload?.stats.totalMinutes ?? 0}
        topGenre={payload?.genreDistribution?.[0]?.name || undefined}
      />

      <StatsOverview stats={payload?.stats ?? null} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ListeningChart data={payload?.listeningChart ?? []} />
        <GenreDistribution genres={payload?.genreDistribution ?? []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopTracks tracks={payload?.topTracks ?? []} />
        <TopArtists artists={payload?.topArtists ?? []} />
        <TopAlbums albums={payload?.topAlbums ?? []} />
      </div>

      <RecentActivity activities={activities} />
    </div>
  );
}
