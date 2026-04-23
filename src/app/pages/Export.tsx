import { useState, useRef } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Download, Loader2, Clock, Music, Headphones, TrendingUp, Calendar, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { SpoticsLogo } from '../components/SpoticsLogo';
import { motion } from 'motion/react';

type ExportTimeRange = 'weekly' | 'monthly' | 'alltime';

export function Export() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRange, setSelectedRange] = useState<ExportTimeRange>('weekly');
  const exportRef = useRef<HTMLDivElement>(null);

  const dataByRange = {
    weekly: {
      title: 'Weekly',
      period: 'Last 7 Days',
      stats: [
        { icon: Clock, label: 'Total Time', value: '23h 15m', color: '#10B981' },
        { icon: Music, label: 'Tracks', value: '412', color: '#3B82F6' },
        { icon: Headphones, label: 'Artists', value: '87', color: '#BE185D' },
        { icon: TrendingUp, label: 'Avg Daily', value: '198 mins', color: '#10B981' }
      ],
      topTracks: [
        { title: 'Anti-Hero', artist: 'Taylor Swift', plays: 34 },
        { title: 'Flowers', artist: 'Miley Cyrus', plays: 28 },
        { title: 'Vampire', artist: 'Olivia Rodrigo', plays: 25 }
      ],
      topArtists: [
        { name: 'Taylor Swift', plays: 89 },
        { name: 'The Weeknd', plays: 67 },
        { name: 'Harry Styles', plays: 54 }
      ],
      genres: [
        { name: 'Pop', value: 35, color: '#10b981' },
        { name: 'Hip Hop', value: 22, color: '#3b82f6' },
        { name: 'Rock', value: 18, color: '#881337' },
        { name: 'Electronic', value: 15, color: '#059669' },
        { name: 'Indie', value: 10, color: '#1e40af' }
      ]
    },
    monthly: {
      title: 'Monthly',
      period: 'Last 30 Days',
      stats: [
        { icon: Clock, label: 'Total Time', value: '87h 42m', color: '#10B981' },
        { icon: Music, label: 'Tracks', value: '1,523', color: '#3B82F6' },
        { icon: Headphones, label: 'Artists', value: '245', color: '#BE185D' },
        { icon: TrendingUp, label: 'Avg Daily', value: '175 mins', color: '#10B981' }
      ],
      topTracks: [
        { title: 'Blinding Lights', artist: 'The Weeknd', plays: 127 },
        { title: 'Stay', artist: 'The Kid LAROI, Justin Bieber', plays: 98 },
        { title: 'As It Was', artist: 'Harry Styles', plays: 86 }
      ],
      topArtists: [
        { name: 'The Weeknd', plays: 287 },
        { name: 'Harry Styles', plays: 198 },
        { name: 'Dua Lipa', plays: 167 }
      ],
      genres: [
        { name: 'Pop', value: 32, color: '#10b981' },
        { name: 'Hip Hop', value: 24, color: '#3b82f6' },
        { name: 'Rock', value: 18, color: '#881337' },
        { name: 'Electronic', value: 16, color: '#059669' },
        { name: 'Indie', value: 10, color: '#1e40af' }
      ]
    },
    alltime: {
      title: 'All Time',
      period: 'Since You Joined',
      stats: [
        { icon: Clock, label: 'Total Time', value: '1,247h 56m', color: '#10B981' },
        { icon: Music, label: 'Tracks', value: '18,923', color: '#3B82F6' },
        { icon: Headphones, label: 'Artists', value: '892', color: '#BE185D' },
        { icon: TrendingUp, label: 'Avg Daily', value: '156 mins', color: '#10B981' }
      ],
      topTracks: [
        { title: 'Blinding Lights', artist: 'The Weeknd', plays: 1247 },
        { title: 'Stay', artist: 'The Kid LAROI, Justin Bieber', plays: 987 },
        { title: 'As It Was', artist: 'Harry Styles', plays: 856 }
      ],
      topArtists: [
        { name: 'The Weeknd', plays: 3487 },
        { name: 'Harry Styles', plays: 2356 },
        { name: 'Dua Lipa', plays: 1998 }
      ],
      genres: [
        { name: 'Pop', value: 32, color: '#10b981' },
        { name: 'Hip Hop', value: 24, color: '#3b82f6' },
        { name: 'Rock', value: 18, color: '#881337' },
        { name: 'Electronic', value: 14, color: '#059669' },
        { name: 'Indie', value: 12, color: '#1e40af' }
      ]
    }
  };

  const currentData = dataByRange[selectedRange];
  const stats = currentData.stats;
  const topTracks = currentData.topTracks;
  const topArtists = currentData.topArtists;
  const genres = currentData.genres;

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
        allowTaint: true
      });
      
      const link = document.createElement('a');
      link.download = `spotics-${selectedRange}-insights-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#021108] border border-[#064E3B] p-8 lg:p-10 mb-8">
        <div className="flex items-start gap-4 mb-8">
          <div className="h-10 w-10 rounded-lg bg-[#064E3B] flex items-center justify-center">
            <Share2 className="h-5 w-5 text-[#10B981]" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#10B981] to-[#3B82F6] bg-clip-text text-transparent mb-2">
              Export Your Insights
            </h1>
            <p className="text-[#D1D5DB]">Create beautiful, shareable snapshots of your music journey</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#030712] border border-[#1F2937] rounded-2xl p-5"
            >
              <div 
                className="h-8 w-8 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
              </div>
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Configuration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Time Range Selector */}
        <Card className="bg-[#111827] border-[#1F2937] rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-5 w-5 text-[#10B981]" />
              <h3 className="text-lg font-semibold text-white">Select Time Range</h3>
            </div>
            
            <div className="bg-[#1F2937] rounded-xl p-1 flex">
              {(['weekly', 'monthly', 'alltime'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                    selectedRange === range
                      ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-lg shadow-green-500/25'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  {range === 'alltime' ? 'All Time' : range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
            
            <p className="text-sm text-[#9CA3AF] mt-4">{currentData.period}</p>
          </CardContent>
        </Card>

        {/* Download & Share */}
        <Card className="bg-[#111827] border-[#1F2937] rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Share2 className="h-5 w-5 text-[#3B82F6]" />
              <h3 className="text-lg font-semibold text-white">Download & Share</h3>
            </div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full bg-[#10B981] hover:bg-[#1ed760] text-white font-semibold py-6 text-base rounded-xl shadow-lg shadow-green-500/25"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download as PNG
                  </>
                )}
              </Button>
            </motion.div>
            
            <p className="text-xs text-[#9CA3AF] mt-4 text-center">
              High-quality 2x resolution • Perfect for social sharing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <div className="mb-8">
        <p className="text-sm text-gray-400 mb-4">Preview</p>
        <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-[#1F2937]">
          <div ref={exportRef} className="bg-black rounded-2xl p-10 max-w-3xl mx-auto border border-[#1F2937]">
            {/* Header with Logo */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#1F2937]">
              <div className="flex items-center gap-3">
                <SpoticsLogo className="h-10 w-10" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Spotics</h2>
                  <p className="text-gray-400 text-sm">Music Listening Insights</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{currentData.period}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-[#030712] rounded-xl p-4 border border-[#1F2937]"
                >
                  <p className="text-xs text-[#9CA3AF] uppercase mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Top Tracks & Artists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">Top Tracks</h3>
                <div className="space-y-3">
                  {topTracks.map((track, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#9CA3AF]">#{index + 1}</span>
                        <div>
                          <p className="text-white text-sm font-medium">{track.title}</p>
                          <p className="text-gray-500 text-xs">{track.artist}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-semibold">{track.plays}</p>
                        <p className="text-gray-500 text-xs">plays</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-4">Top Artists</h3>
                <div className="space-y-3">
                  {topArtists.map((artist, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#9CA3AF]">{index + 1}</span>
                        <p className="text-white text-sm font-medium">{artist.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-semibold">{artist.plays}</p>
                        <p className="text-gray-500 text-xs">plays</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Genre Distribution */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-white mb-4">Top Genres</h3>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre, index) => (
                  <span key={index} className="text-sm text-[#9CA3AF]">
                    {genre.name} {genre.value}%
                    {index < genres.length - 1 && <span className="ml-2">•</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-[#1F2937] text-center">
              <p className="text-gray-500 text-sm">
                Generated with ❤️ by Spotics • {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <Card className="bg-[#111827] border-[#1F2937] rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-6">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Select your preferred time range: Weekly, Monthly, or All Time stats',
              'Click the "Download as PNG" button to generate a high-quality image',
              'Share your music taste on social media with friends and followers',
              'Image includes stats, top tracks, artists, and genre distribution'
            ].map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-[#1F2937] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#10B981]">{index + 1}</span>
                </div>
                <p className="text-[#9CA3AF] text-sm pt-1">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
