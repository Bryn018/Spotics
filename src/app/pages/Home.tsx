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
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';

export function Home() {
  const { data, isLoading, syncing, sync, isError } = useDashboardData();
  const payload = data?.summary?.payload;
  const activities = data?.activities ?? [];

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px] flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your music data...</p>
        </div>
      </main>
    );
  }

  if (isError || (!payload && !syncing)) {
    return (
      <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to Spotics</h2>
          <p className="text-gray-400 mb-6">Sync your Spotify listening data to get started</p>
          <Button onClick={sync} disabled={syncing} className="bg-gradient-to-r from-green-500 to-blue-500">
            {syncing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing...</>
            ) : (
              <><RefreshCw className="mr-2 h-4 w-4" /> Sync with Spotify</>
            )}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
      {/* Sync Banner */}
      {syncing && (
        <div className="mb-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-green-400 animate-spin" />
          <p className="text-green-400 text-sm">Syncing your Spotify data...</p>
        </div>
      )}

      {/* Hero Section */}
      <div className="mb-10">
        <WrappedSelector heroData={payload?.hero} />
      </div>
      
      {/* Time Range Selector */}
      <div className="mb-8">
        <TimeRangeSelector />
      </div>
      
      {/* Stats Overview */}
      <div className="mb-12">
        <StatsOverview stats={payload?.stats} />
      </div>
      
      {/* Top Albums Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-white light:text-gray-900">Top Albums</h2>
        </div>
        <TopAlbums albums={payload?.topAlbums} />
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 mb-12">
        {/* Left Column - Tracks & Artists */}
        <div className="xl:col-span-8 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white light:text-gray-900">Top Tracks</h2>
            </div>
            <TopTracks tracks={payload?.topTracks} />
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white light:text-gray-900">Top Artists</h2>
            </div>
            <TopArtists artists={payload?.topArtists} />
          </div>
        </div>
        
        {/* Right Column - Recent Activity */}
        <div className="xl:col-span-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-rose-900 to-rose-800 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white light:text-gray-900">Recent Activity</h2>
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
          <h2 className="text-2xl font-bold text-white light:text-gray-900">Analytics</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <ListeningChart chartData={payload?.listeningChart} />
          <GenreDistribution genres={payload?.genreDistribution} />
        </div>
      </div>
    </main>
  );
}
