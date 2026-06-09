import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { NavBar } from '../components/NavBar';
import { Download, Loader2, Upload, ChevronLeft, ChevronRight, Calendar, Music, Headphones, Clock } from 'lucide-react';

type RangeKey = 'weekly' | 'monthly' | 'alltime';

export function WrapReports() {
  const navigate = useNavigate();
  const { data, error } = useData();
  const [activeRange, setActiveRange] = useState<RangeKey>('weekly');

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-mono mb-4">Error: {error}</p>
          <button onClick={() => navigate('/')} className="text-green-400 font-mono hover:underline">Upload new data</button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <p className="text-gray-400 font-mono">Loading...</p>
        <button onClick={() => navigate('/')} className="text-green-400 hover:underline font-mono text-sm">
          <Upload className="inline h-4 w-4 mr-1" />Upload your data
        </button>
      </div>
    );
  }

  const rangeData = data.exportData[activeRange];
  const ranges: { key: RangeKey; label: string }[] = [
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'alltime', label: 'All Time' },
  ];

  const currentIdx = ranges.findIndex(r => r.key === activeRange);

  return (
    <div className="min-h-screen bg-black">
      <NavBar currentPage="wraps" />
      <main className="container mx-auto px-4 lg:px-6 py-10 max-w-[1600px]">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-white font-mono">Wrap Reports</h1>
            <p className="text-gray-500 font-mono text-sm mt-1">Your listening summary — like Spotify Wrapped, but yours</p>
          </div>

          {/* Range Selector */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveRange(ranges[(currentIdx - 1 + ranges.length) % ranges.length].key)}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {ranges.map(r => (
                <button
                  key={r.key}
                  onClick={() => setActiveRange(r.key)}
                  className={`px-4 py-2 rounded-lg font-mono text-sm transition-colors ${
                    activeRange === r.key
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700/50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setActiveRange(ranges[(currentIdx + 1) % ranges.length].key)}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Wrap Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800/50 rounded-2xl p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 pb-6 border-b border-gray-800/50">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent font-mono">
                {rangeData.title}
              </h2>
              <p className="text-gray-500 font-mono text-sm mt-2 flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                {rangeData.period}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {rangeData.stats.map((stat, i) => {
                const Icon = stat.icon === 'clock' ? Clock : stat.icon === 'music' ? Music : stat.icon === 'user' ? Headphones : Clock;
                return (
                  <div key={i} className="bg-gray-800/30 rounded-lg p-4 text-center">
                    <Icon className={`h-5 w-5 ${stat.color} mx-auto mb-2`} />
                    <p className="text-2xl font-bold text-white font-mono">{stat.value}</p>
                    <p className="text-gray-500 text-xs font-mono">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Top Tracks */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-white font-mono mb-4 flex items-center gap-2">
                <Music className="h-4 w-4 text-green-400" />
                Top Tracks
              </h3>
              <div className="space-y-3">
                {rangeData.topTracks.map((track, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/20 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-green-400 font-mono text-sm w-5">{i + 1}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{track.title}</p>
                        <p className="text-gray-500 text-xs">{track.artist}</p>
                      </div>
                    </div>
                    <span className="text-green-400 font-mono text-sm">{track.plays} plays</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Artists */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-white font-mono mb-4 flex items-center gap-2">
                <Headphones className="h-4 w-4 text-blue-400" />
                Top Artists
              </h3>
              <div className="space-y-3">
                {rangeData.topArtists.map((artist, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/20 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400 font-mono text-sm w-5">{i + 1}</span>
                      <p className="text-white text-sm font-medium">{artist.name}</p>
                    </div>
                    <span className="text-blue-400 font-mono text-sm">{artist.plays} plays</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div>
              <h3 className="text-lg font-bold text-white font-mono mb-4">Top Genres</h3>
              <div className="space-y-3">
                {rangeData.genres.map((genre, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-300 text-sm font-mono">{genre.name}</span>
                      <span className="text-gray-500 text-xs font-mono">{genre.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${genre.value}%`, backgroundColor: genre.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-800/50 text-center">
              <p className="text-gray-600 font-mono text-xs">
                Generated by Spotics • {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
