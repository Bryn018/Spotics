import { useState, useRef } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Download, Loader2, Clock, Music, Headphones, TrendingUp, Calendar, Play } from 'lucide-react';
import html2canvas from 'html2canvas';
import { SpoticsLogo } from '../components/SpoticsLogo';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';

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
        { icon: Clock, label: 'Total Time', value: '23h 15m', color: 'from-green-500 to-green-600' },
        { icon: Music, label: 'Tracks', value: '412', color: 'from-blue-500 to-blue-600' },
        { icon: Headphones, label: 'Artists', value: '87', color: 'from-rose-800 to-rose-900' },
        { icon: TrendingUp, label: 'Avg Daily', value: '198 mins', color: 'from-green-600 to-blue-500' }
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
        { icon: Clock, label: 'Total Time', value: '87h 42m', color: 'from-green-500 to-green-600' },
        { icon: Music, label: 'Tracks', value: '1,523', color: 'from-blue-500 to-blue-600' },
        { icon: Headphones, label: 'Artists', value: '245', color: 'from-rose-800 to-rose-900' },
        { icon: TrendingUp, label: 'Avg Daily', value: '175 mins', color: 'from-green-600 to-blue-500' }
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
        { icon: Clock, label: 'Total Time', value: '1,247h 56m', color: 'from-green-500 to-green-600' },
        { icon: Music, label: 'Tracks', value: '18,923', color: 'from-blue-500 to-blue-600' },
        { icon: Headphones, label: 'Artists', value: '892', color: 'from-rose-800 to-rose-900' },
        { icon: TrendingUp, label: 'Avg Daily', value: '156 mins', color: 'from-green-600 to-blue-500' }
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
      // Wait a bit for any animations to complete
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
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 w-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
          <h1 className="text-3xl font-bold text-white">Export Your Insights</h1>
        </div>
        <p className="text-gray-400">Download a shareable image of your music listening statistics</p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Select Time Range</h3>
        <Tabs value={selectedRange} onValueChange={(value) => setSelectedRange(value as ExportTimeRange)}>
          <TabsList className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 p-1">
            <TabsTrigger
              value="weekly"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/30 data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white transition-all px-6 py-2 text-sm font-semibold"
            >
              Weekly Stats
            </TabsTrigger>
            <TabsTrigger
              value="monthly"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white transition-all px-6 py-2 text-sm font-semibold"
            >
              Monthly Stats
            </TabsTrigger>
            <TabsTrigger
              value="alltime"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-rose-500/30 data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white transition-all px-6 py-2 text-sm font-semibold"
            >
              All Time
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Download Button */}
      <div className="mb-8">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Download {currentData.title} Stats as PNG
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Export Preview */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <div ref={exportRef} className="bg-black rounded-2xl p-12 max-w-4xl mx-auto">
          {/* Header with Logo */}
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-800">
            <div className="flex items-center gap-4">
              <SpoticsLogo className="h-12 w-12" />
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Spotics
                </h2>
                <p className="text-gray-400 text-sm">Music Listening Insights</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{currentData.period}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800"
              >
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-20 flex items-center justify-center mb-4`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* Top Tracks */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Play className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Top Tracks</h3>
              </div>
              <div className="space-y-4">
                {topTracks.map((track, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{track.title}</p>
                      <p className="text-gray-400 text-sm">{track.artist}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-semibold">{track.plays}</p>
                      <p className="text-gray-500 text-xs">plays</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Artists */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Headphones className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Top Artists</h3>
              </div>
              <div className="space-y-4">
                {topArtists.map((artist, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500/20 to-rose-900/20 flex items-center justify-center text-blue-400 font-bold">
                        {index + 1}
                      </div>
                      <p className="text-white font-medium">{artist.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-400 font-semibold">{artist.plays}</p>
                      <p className="text-gray-500 text-xs">plays</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Genre Distribution */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-800 to-rose-900 flex items-center justify-center">
                <Music className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Top Genres</h3>
            </div>
            <div className="space-y-3">
              {genres.map((genre, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{genre.name}</span>
                    <span className="text-gray-400 text-sm">{genre.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${genre.value * 3.125}%`,
                        backgroundColor: genre.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm">
              Generated with ❤️ by Spotics • {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <Card className="mt-8 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">How to use</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>Select your preferred time range: Weekly, Monthly, or All Time stats</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Click the "Download as PNG" button to generate a high-quality image of your insights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-800 mt-1">•</span>
              <span>Share your music taste on social media with friends</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">•</span>
              <span>The image includes your top stats, tracks, artists, and genre distribution for the selected period</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
