import { Loader2, RefreshCw } from 'lucide-react';
import { WrappedSelector } from '../components/WrappedSelector';
import { TimeRangeSelector } from '../components/TimeRangeSelector';
import { StatsOverview } from '../components/StatsOverview';
import { TopTracks } from '../components/TopTracks';
import { TopArtists } from '../components/TopArtists';
import { TopAlbums } from '../components/TopAlbums';
import { ListeningChart } from '../components/ListeningChart';
import { GenreDistribution } from '../components/GenreDistribution';
import { RecentActivity } from '../components/RecentActivity';
import { useDashboardData } from '../context/DashboardContext';
import { Button } from '../components/ui/button';

export function Home() {
  const { data, isLoading, isError, refetch, sync, syncing } = useDashboardData();
  const summary = data?.summary;

  if (isLoading && !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <Loader2 className="h-10 w-10 animate-spin text-purple-400 mb-4" />
        <p className="text-lg text-white font-semibold">Loading your listening summary…</p>
        <p className="text-sm text-gray-400">Fetching the freshest insights from Spotify.</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 gap-4">
        <p className="text-2xl font-semibold text-white">We couldn’t load the dashboard.</p>
        <p className="text-gray-400 max-w-md">
          Something went wrong while talking to the API. Refresh to try again.
        </p>
        <Button onClick={() => refetch()} className="bg-gradient-to-r from-purple-500 to-pink-500">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>
    );
  }

  const hasSummary = Boolean(summary?.payload);

  if (!hasSummary) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 gap-4">
        <p className="text-2xl font-semibold text-white">Let’s import your listening history</p>
        <p className="text-gray-400 max-w-xl">
          You’re logged in, but there’s no data yet. Trigger a sync and we’ll pull your Spotify stats for all timeframes.
        </p>
        <Button onClick={() => sync()} disabled={syncing} className="bg-gradient-to-r from-purple-500 to-pink-500">
          {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh data
        </Button>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
      <div className="mb-10">
        <WrappedSelector />
      </div>

      <div className="mb-8">
        <TimeRangeSelector />
      </div>

      <div className="mb-12">
        <StatsOverview />
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">Top Albums</h2>
        </div>
        <TopAlbums />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 mb-12">
        <div className="xl:col-span-8 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">Top Tracks</h2>
            </div>
            <TopTracks />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">Top Artists</h2>
            </div>
            <TopArtists />
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
          </div>
          <div className="xl:sticky xl:top-24">
            <RecentActivity />
          </div>
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <ListeningChart />
          <GenreDistribution />
        </div>
      </div>
    </main>
  );
}
