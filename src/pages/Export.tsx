import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { NavBar } from '../components/NavBar';
import { Download, Loader2, Upload, Calendar, Music, Headphones, Clock } from 'lucide-react';
import html2canvas from 'html2canvas';

type RangeKey = 'weekly' | 'monthly' | 'alltime';

export function Export() {
  const navigate = useNavigate();
  const { data, error } = useData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeRange, setActiveRange] = useState<RangeKey>('alltime');
  const exportRef = useRef<HTMLDivElement>(null);

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

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      const link = document.createElement('a');
      link.download = `spotics-${activeRange}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Error generating image:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <NavBar currentPage="export" />
      <main className="container mx-auto px-4 lg:px-6 py-10 max-w-[1600px]">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-white font-mono">Export</h1>
            <p className="text-gray-500 font-mono text-sm mt-1">Download and share your listening insights</p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Range selector */}
            <div className="flex gap-2">
              {(['weekly', 'monthly', 'alltime'] as RangeKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => setActiveRange(key)}
                  className={`px-4 py-2 rounded-lg font-mono text-sm transition-colors ${
                    activeRange === key
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700/50'
                  }`}
                >
                  {key === 'weekly' ? 'Weekly' : key === 'monthly' ? 'Monthly' : 'All Time'}
                </button>
              ))}
            </div>

            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-mono text-sm transition-colors"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isGenerating ? 'Generating...' : 'Download PNG'}
            </button>
          </div>

          {/* Export Preview */}
          <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800/50">
            <div ref={exportRef} className="bg-black rounded-2xl p-10 max-w-3xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800/50">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent font-mono">
                    Spotics
                  </h2>
                  <p className="text-gray-500 text-sm font-mono">Music Listening Insights</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm font-mono flex items-center gap-2 justify-end">
                    <Calendar className="h-4 w-4" />
                    {rangeData.period}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {rangeData.stats.map((stat, i) => {
                  const Icon = stat.icon === 'clock' ? Clock : stat.icon === 'music' ? Music : stat.icon === 'user' ? Headphones : Clock;
                  return (
                    <div key={i} className="bg-gray-900/80 rounded-xl p-4 border border-gray-800/50">
                      <Icon className={`h-5 w-5 ${stat.color} mb-2`} />
                      <p className="text-gray-500 text-xs font-mono">{stat.label}</p>
                      <p className="text-xl font-bold text-white font-mono">{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Top Tracks & Artists */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-900/80 rounded-xl p-5 border border-gray-800/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Music className="h-4 w-4 text-green-400" />
                    <h3 className="text-lg font-bold text-white font-mono">Top Tracks</h3>
                  </div>
                  <div className="space-y-3">
                    {rangeData.topTracks.map((track, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm">{track.title}</p>
                          <p className="text-gray-500 text-xs">{track.artist}</p>
                        </div>
                        <span className="text-green-400 font-mono text-sm">{track.plays}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900/80 rounded-xl p-5 border border-gray-800/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Headphones className="h-4 w-4 text-blue-400" />
                    <h3 className="text-lg font-bold text-white font-mono">Top Artists</h3>
                  </div>
                  <div className="space-y-3">
                    {rangeData.topArtists.map((artist, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 font-mono text-sm">{i + 1}</span>
                          <p className="text-white text-sm">{artist.name}</p>
                        </div>
                        <span className="text-blue-400 font-mono text-sm">{artist.plays}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Genres */}
              <div className="bg-gray-900/80 rounded-xl p-5 border border-gray-800/50">
                <h3 className="text-lg font-bold text-white font-mono mb-4">Top Genres</h3>
                <div className="space-y-3">
                  {rangeData.genres.map((genre, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-300 text-sm font-mono">{genre.name}</span>
                        <span className="text-gray-500 text-xs font-mono">{genre.value}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${genre.value}%`, backgroundColor: genre.color }} />
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
        </div>
      </main>
    </div>
  );
}
