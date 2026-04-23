import { WrappedSelector } from '../components/WrappedSelector';
import { TimeRangeSelector } from '../components/TimeRangeSelector';
import { StatsOverview } from '../components/StatsOverview';
import { TopTracks } from '../components/TopTracks';
import { TopArtists } from '../components/TopArtists';
import { TopAlbums } from '../components/TopAlbums';
import { ListeningChart } from '../components/ListeningChart';
import { GenreDistribution } from '../components/GenreDistribution';
import { RecentActivity } from '../components/RecentActivity';
import { NowPlaying } from '../components/NowPlaying';
import { useDashboardData } from '../context/DashboardContext';
import { useSession } from '../context/SessionContext';
import { useNowPlaying } from '../hooks/useDashboard';
import { Loader2, RefreshCw, LogIn, Music2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { apiBaseUrl, apiRoutes } from '../lib/api';
import { ActivityDialog } from '../components/ActivityDialog';
import { useState } from 'react';

export function Home() {
  const { data, isLoading, syncing, sync, isError } = useDashboardData();
  const { authenticated, isLoading: sessionLoading } = useSession();
  const nowPlayingQuery = useNowPlaying(authenticated && !sessionLoading);
  const payload = data?.summary?.payload;
  const activities = data?.activities ?? [];
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);

  // Loading state
  if (isLoading || sessionLoading) {
    return (
      <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px] flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your music data...</p>
        </div>
      </main>
    );
  }

  // Not authenticated - need to login
  if (!authenticated) {
    return (
      <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="p-6 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 mb-6">
            <Music2 className="h-16 w-16 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Welcome to Spotics</h2>
          <p className="text-gray-400 mb-8 max-w-md">
            Connect your Spotify account to see your personal music analytics, top tracks, artists, and listening habits.
          </p>
          <a href={`${apiBaseUrl}${apiRoutes.login}`}>
            <Button size="lg" className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold px-8 py-6 text-lg rounded-full shadow-lg shadow-green-500/20">
              <svg className="mr-3 h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Login with Spotify
            </Button>
          </a>
          <p className="text-gray-500 text-sm mt-4">You'll be redirected to Spotify to authorize access</p>
        </div>
      </main>
    );
  }

  // Authenticated but no data yet
  if (!payload && !syncing) {
    return (
      <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="p-6 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 mb-6">
            <Music2 className="h-16 w-16 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Sync Your Music</h2>
          <p className="text-gray-400 mb-8 max-w-md">
            Pull your Spotify listening data to populate your dashboard with top tracks, artists, and stats.
          </p>
          <Button
            onClick={sync}
            disabled={syncing}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 font-semibold px-8 py-6 text-lg rounded-full"
          >
            {syncing ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Syncing your data...</>
            ) : (
              <><RefreshCw className="mr-2 h-5 w-5" /> Sync Now</>
            )}
          </Button>
          {isError && (
            <p className="text-red-400 text-sm mt-4">Something went wrong. Try logging in again.</p>
          )}
        </div>
      </main>
    );
  }

  // Authenticated with data - show full dashboard
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

      {/* Now Playing */}
      <div className="mb-8">
        <NowPlaying nowPlaying={nowPlayingQuery.data} />
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
          <h2 className="text-2xl font-bold text-white">Top Albums</h2>
        </div>
        <TopAlbums albums={payload?.topAlbums} />
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 mb-12">
        <div className="xl:col-span-8 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">Top Tracks</h2>
            </div>
            <TopTracks tracks={payload?.topTracks} />
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white">Top Artists</h2>
            </div>
            <TopArtists artists={payload?.topArtists} />
          </div>
        </div>
        
        <div className="xl:col-span-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-rose-900 to-rose-800 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
          </div>
          <div className="xl:sticky xl:top-24">
            <RecentActivity activities={activities} onViewAll={() => setActivityDialogOpen(true)} />
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
          <ListeningChart chartData={payload?.listeningChart} />
          <GenreDistribution genres={payload?.genreDistribution} />
        </div>
      </div>

      <ActivityDialog
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
        activities={activities}
      />
    </main>
  );
}
