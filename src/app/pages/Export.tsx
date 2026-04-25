import { useState, useRef } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Download, Loader2, Clock, Music, Headphones, TrendingUp, Calendar, Play, Sparkles, Share2, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import { SpoticsLogo } from '../components/SpoticsLogo';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useExport } from '../hooks/useExport';
import type { ExportRangeData } from '../types';

const iconMap: Record<string, React.ElementType> = {
  Clock,
  Music,
  Headphones,
  TrendingUp,
};

function getIcon(name: string) {
  return iconMap[name] ?? Music;
}

type ExportTimeRange = 'weekly' | 'monthly' | 'alltime';

export function Export() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRange, setSelectedRange] = useState<ExportTimeRange>('weekly');
  const [downloadComplete, setDownloadComplete] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useExport();

  const currentData: ExportRangeData = data?.[selectedRange] ?? {
    title: 'Weekly',
    period: 'Last 7 Days',
    stats: [
      { icon: 'Clock', label: 'Total Time', value: '—', color: 'from-green-500 to-green-600' },
      { icon: 'Music', label: 'Tracks', value: '—', color: 'from-blue-500 to-blue-600' },
      { icon: 'Headphones', label: 'Artists', value: '—', color: 'from-rose-800 to-rose-900' },
      { icon: 'TrendingUp', label: 'Avg Daily', value: '—', color: 'from-green-600 to-blue-500' },
    ],
    topTracks: [],
    topArtists: [],
    genres: [],
  };

  const stats = currentData.stats;
  const topTracks = currentData.topTracks;
  const topArtists = currentData.topArtists;
  const genres = currentData.genres;

  const handleDownload = async () => {
    if (!exportRef.current) return;

    setIsGenerating(true);
    setDownloadComplete(false);

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
      link.download = `spotics-${selectedRange}-insights-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setDownloadComplete(true);
      setTimeout(() => setDownloadComplete(false), 3000);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1400px]">
      {/* Hero Section */}
      <div className="mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500/10 via-teal-500/10 to-blue-500/10 border border-green-500/20 p-8 lg:p-12">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-green-500/30">
              <ImageIcon className="h-6 w-6 text-green-400" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
              Export Your Insights
            </h1>
          </motion.div>
          <p className="text-gray-300 text-lg max-w-2xl">
            Create beautiful, shareable snapshots of your music journey
          </p>

          {/* Stats preview cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10 animate-pulse">
                  <div className="h-8 w-8 rounded-lg bg-gray-700 mb-2" />
                  <div className="h-3 w-16 bg-gray-700 rounded mb-1" />
                  <div className="h-6 w-20 bg-gray-700 rounded" />
                </div>
              ))
            ) : (
              stats.map((stat, index) => {
                const Icon = getIcon(stat.icon);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-green-500/30 transition-all"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-20 w-fit mb-2`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
                    <p className="text-white font-bold text-lg">{stat.value}</p>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Select Time Range</h3>
            </div>
            <Tabs value={selectedRange} onValueChange={(value) => setSelectedRange(value as ExportTimeRange)}>
              <TabsList className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 p-1 w-full">
                <TabsTrigger
                  value="weekly"
                  className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/30 data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white transition-all px-4 py-2.5 text-sm font-semibold"
                >
                  Weekly
                </TabsTrigger>
                <TabsTrigger
                  value="monthly"
                  className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white transition-all px-4 py-2.5 text-sm font-semibold"
                >
                  Monthly
                </TabsTrigger>
                <TabsTrigger
                  value="alltime"
                  className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/30 data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white transition-all px-4 py-2.5 text-sm font-semibold"
                >
                  All Time
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-gray-400 text-sm mt-3">
              {currentData.period}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Download & Share</h3>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleDownload}
                disabled={isGenerating || isLoading}
                className="w-full bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 hover:from-green-700 hover:via-teal-700 hover:to-blue-700 text-white font-semibold px-6 py-6 text-base rounded-xl shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Image...
                  </>
                ) : downloadComplete ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Downloaded Successfully!
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download as PNG
                  </>
                )}
              </Button>
            </motion.div>
            <p className="text-gray-400 text-xs mt-3 text-center">
              High-quality 2x resolution • Perfect for social sharing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Export Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-teal-500/5 to-blue-500/5 rounded-2xl blur-xl" />
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-2xl p-4 lg:p-8 border border-gray-700/50 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-gray-400 text-sm font-medium">Preview</p>
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/50" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
              <div className="h-3 w-3 rounded-full bg-green-500/50" />
            </div>
          </div>

          <div ref={exportRef} className="rounded-2xl p-8 lg:p-12 max-w-4xl mx-auto shadow-2xl" style={{ background: 'linear-gradient(to bottom right, #000000, #111827, #000000)', border: '1px solid rgba(31, 41, 55, 0.5)' }}>
            {/* Header with Logo */}
            <div className="flex items-center justify-between mb-8 pb-8" style={{ borderBottom: '1px solid #374151' }}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <SpoticsLogo className="h-14 w-14" />
                </div>
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-1" style={{ color: '#22c55e' }}>
                    Spotics
                  </h2>
                  <p className="text-sm font-medium" style={{ color: '#9ca3af' }}>Music Listening Insights</p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'linear-gradient(to right, rgba(31, 41, 55, 0.8), rgba(55, 65, 81, 0.8))', border: '1px solid rgba(55, 65, 81, 0.5)' }}>
                  <Calendar className="h-4 w-4" style={{ color: '#22c55e' }} />
                  <span className="text-sm font-medium" style={{ color: '#d1d5db' }}>{currentData.period}</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl p-4 lg:p-5 shadow-lg animate-pulse" style={{ background: 'linear-gradient(to bottom right, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.8))', border: '1px solid rgba(55, 65, 81, 0.5)' }}>
                    <div className="h-10 w-10 rounded-lg bg-gray-700 mb-3" />
                    <div className="h-3 w-16 bg-gray-700 rounded mb-1" />
                    <div className="h-8 w-20 bg-gray-700 rounded" />
                  </div>
                ))
              ) : (
                stats.map((stat, index) => {
                  const Icon = getIcon(stat.icon);
                  return (
                    <div
                      key={index}
                      className="relative rounded-xl p-4 lg:p-5 shadow-lg overflow-hidden"
                      style={{ background: 'linear-gradient(to bottom right, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.8))', border: '1px solid rgba(55, 65, 81, 0.5)' }}
                    >
                      <div className={`relative h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                        <Icon className="h-5 w-5" style={{ color: '#ffffff' }} />
                      </div>
                      <p className="relative text-xs font-medium mb-1 uppercase tracking-wide" style={{ color: '#9ca3af' }}>{stat.label}</p>
                      <p className="relative text-2xl lg:text-3xl font-bold" style={{ color: '#ffffff' }}>{stat.value}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
              {/* Top Tracks */}
              <div className="relative rounded-2xl p-6 shadow-xl overflow-hidden" style={{ background: 'linear-gradient(to bottom right, rgba(17, 24, 39, 0.9), rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.9))', border: '1px solid rgba(55, 65, 81, 0.5)' }}>
                <div className="relative flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #22c55e, #14b8a6)' }}>
                    <Play className="h-5 w-5" style={{ color: '#ffffff' }} />
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>Top Tracks</h3>
                </div>
                <div className="relative space-y-4">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl animate-pulse" style={{ background: 'rgba(31, 41, 55, 0.4)', border: '1px solid rgba(55, 65, 81, 0.3)' }}>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-8 w-8 rounded-lg bg-gray-700" />
                          <div className="flex-1">
                            <div className="h-4 w-32 bg-gray-700 rounded mb-1" />
                            <div className="h-3 w-20 bg-gray-700 rounded" />
                          </div>
                        </div>
                        <div className="h-6 w-10 bg-gray-700 rounded" />
                      </div>
                    ))
                  ) : (
                    topTracks.map((track, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-xl transition-all" style={{ background: 'rgba(31, 41, 55, 0.4)', border: '1px solid rgba(55, 65, 81, 0.3)' }}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, rgba(34, 197, 94, 0.2), rgba(20, 184, 166, 0.2))' }}>
                            <span className="font-bold text-sm" style={{ color: '#22c55e' }}>#{index + 1}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate" style={{ color: '#ffffff' }}>{track.title}</p>
                            <p className="text-sm truncate" style={{ color: '#9ca3af' }}>{track.artist}</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right ml-4">
                          <p className="font-bold text-lg" style={{ color: '#22c55e' }}>{track.plays}</p>
                          <p className="text-xs uppercase tracking-wide" style={{ color: '#6b7280' }}>plays</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Top Artists */}
              <div className="relative rounded-2xl p-6 shadow-xl overflow-hidden" style={{ background: 'linear-gradient(to bottom right, rgba(17, 24, 39, 0.9), rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.9))', border: '1px solid rgba(55, 65, 81, 0.5)' }}>
                <div className="relative flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #3b82f6, #6366f1)' }}>
                    <Headphones className="h-5 w-5" style={{ color: '#ffffff' }} />
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>Top Artists</h3>
                </div>
                <div className="relative space-y-4">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl animate-pulse" style={{ background: 'rgba(31, 41, 55, 0.4)', border: '1px solid rgba(55, 65, 81, 0.3)' }}>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-10 w-10 rounded-full bg-gray-700" />
                          <div className="h-4 w-28 bg-gray-700 rounded" />
                        </div>
                        <div className="h-6 w-10 bg-gray-700 rounded" />
                      </div>
                    ))
                  ) : (
                    topArtists.map((artist, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-xl transition-all" style={{ background: 'rgba(31, 41, 55, 0.4)', border: '1px solid rgba(55, 65, 81, 0.3)' }}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.3), rgba(99, 102, 241, 0.3))', border: '2px solid rgba(59, 130, 246, 0.3)' }}>
                            {artist.image ? (
                              <img src={artist.image} alt={artist.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="font-bold" style={{ color: '#3b82f6' }}>{index + 1}</span>
                            )}
                          </div>
                          <p className="font-semibold truncate flex-1 min-w-0" style={{ color: '#ffffff' }}>{artist.name}</p>
                        </div>
                        <div className="flex-shrink-0 text-right ml-4">
                          <p className="font-bold text-lg" style={{ color: '#3b82f6' }}>{artist.plays}</p>
                          <p className="text-xs uppercase tracking-wide" style={{ color: '#6b7280' }}>plays</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Genre Distribution */}
            <div className="relative rounded-2xl p-6 shadow-xl overflow-hidden" style={{ background: 'linear-gradient(to bottom right, rgba(17, 24, 39, 0.9), rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.9))', border: '1px solid rgba(55, 65, 81, 0.5)' }}>
              <div className="relative flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, #881337, #9f1239)' }}>
                  <Music className="h-5 w-5" style={{ color: '#ffffff' }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>Top Genres</h3>
              </div>
              <div className="relative space-y-4">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-4 w-20 bg-gray-700 rounded" />
                        <div className="h-4 w-10 bg-gray-700 rounded" />
                      </div>
                      <div className="h-3 rounded-full bg-gray-700" />
                    </div>
                  ))
                ) : (
                  genres.map((genre, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold" style={{ color: '#ffffff' }}>{genre.name}</span>
                        <span className="text-sm font-bold" style={{ color: '#d1d5db' }}>{genre.value}%</span>
                      </div>
                      <div className="h-3 rounded-full overflow-hidden shadow-inner" style={{ background: 'rgba(31, 41, 55, 0.6)', border: '1px solid rgba(55, 65, 81, 0.5)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500 shadow-lg relative overflow-hidden"
                          style={{
                            width: `${Math.min(genre.value * 3.125, 100)}%`,
                            background: `linear-gradient(90deg, ${genre.color}, ${genre.color}dd)`
                          }}
                        >
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)' }} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid #374151' }}>
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm" style={{ color: '#9ca3af' }}>
                  Generated with
                </p>
                <span style={{ color: '#ef4444' }}>❤️</span>
                <p className="text-sm" style={{ color: '#9ca3af' }}>
                  by <span className="font-semibold" style={{ color: '#22c55e' }}>Spotics</span>
                </p>
                <span style={{ color: '#4b5563' }}>•</span>
                <p className="text-sm" style={{ color: '#6b7280' }}>
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="mt-8 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700/50 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center border border-green-500/30">
                <ImageIcon className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white">How to Use</h3>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-800/40 border border-gray-700/30">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-green-500/20">
                  1
                </div>
                <p className="text-gray-300 text-sm">Select your preferred time range: Weekly, Monthly, or All Time stats</p>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-800/40 border border-gray-700/30">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                  2
                </div>
                <p className="text-gray-300 text-sm">Click the "Download as PNG" button to generate a high-quality image</p>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-800/40 border border-gray-700/30">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                  3
                </div>
                <p className="text-gray-300 text-sm">Share your music taste on social media with friends and followers</p>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-800/40 border border-gray-700/30">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-rose-800 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-rose-800/20">
                  4
                </div>
                <p className="text-gray-300 text-sm">Image includes stats, top tracks, artists, and genre distribution</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
