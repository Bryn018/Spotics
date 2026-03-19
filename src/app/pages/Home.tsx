import { HeroSection } from '../components/HeroSection';
import { TimeRangeSelector } from '../components/TimeRangeSelector';
import { StatsOverview } from '../components/StatsOverview';
import { TopTracks } from '../components/TopTracks';
import { TopArtists } from '../components/TopArtists';
import { TopAlbums } from '../components/TopAlbums';
import { ListeningChart } from '../components/ListeningChart';
import { GenreDistribution } from '../components/GenreDistribution';
import { RecentActivity } from '../components/RecentActivity';

export function Home() {
  return (
    <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
      {/* Hero Section */}
      <div className="mb-10">
        <HeroSection />
      </div>
      
      {/* Time Range Selector */}
      <div className="mb-8">
        <TimeRangeSelector />
      </div>
      
      {/* Stats Overview */}
      <div className="mb-12">
        <StatsOverview />
      </div>
      
      {/* Top Albums Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-white">Top Albums</h2>
        </div>
        <TopAlbums />
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 mb-12">
        {/* Left Column - Tracks & Artists */}
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
        
        {/* Right Column - Recent Activity */}
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
      
      {/* Analytics Section */}
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
