import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { StatsOverview } from '../components/StatsOverview';
import { TopTracks } from '../components/TopTracks';
import { TopArtists } from '../components/TopArtists';
import { TopAlbums } from '../components/TopAlbums';
import { ListeningChart } from '../components/ListeningChart';
import { GenreDistribution } from '../components/GenreDistribution';
import { NavBar } from '../components/NavBar';
import { Loader2, Upload } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const { data, error } = useData();

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-mono mb-4">Error: {error}</p>
          <button onClick={() => navigate('/')} className="text-green-400 font-mono hover:underline">
            Upload new data
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <p className="text-gray-400 font-mono">Loading your data...</p>
        <p className="text-gray-600 font-mono text-sm">
          <button onClick={() => navigate('/')} className="text-green-400 hover:underline">
            <Upload className="inline h-4 w-4 mr-1" />
            Upload your Spotify data
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <NavBar currentPage="dashboard" />
      <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
        <div className="space-y-8">
          {/* Stats Overview */}
          <StatsOverview data={data} />

          {/* Top Albums */}
          <section className="mb-12">
            <TopAlbums items={data.albums.slice(0, 10)} />
          </section>

          {/* Main grid: Top Tracks + Top Artists */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 mb-12">
            <div className="xl:col-span-7">
              <TopTracks items={data.tracks.slice(0, 20)} />
            </div>
            <div className="xl:col-span-5">
              <TopArtists items={data.artists.slice(0, 20)} />
            </div>
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ListeningChart data={data.listeningChart} />
            <GenreDistribution items={data.genres} />
          </div>
        </div>
      </main>
    </div>
  );
}
