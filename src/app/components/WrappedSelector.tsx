import { Button } from './ui/button';
import { Play, Sparkles, Calendar, TrendingUp, Music, Headphones, Disc3, Radio, Star, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useMemo } from 'react';
import { StoriesViewer } from './StoriesViewer';
import { useWrap } from '../hooks/useWrap';
import type { DashboardPayload } from '../types';

export function WrappedSelector({ heroData }: { heroData?: DashboardPayload['hero'] }) {
  const [activeWrap, setActiveWrap] = useState<'daily' | 'weekly' | 'yearly'>('yearly');
  const [viewerOpen, setViewerOpen] = useState(false);

  // Fetch real wrap data for all timeframes so stats are accurate
  const dailyQuery = useWrap('daily', true);
  const weeklyQuery = useWrap('weekly', true);
  const yearlyQuery = useWrap('yearly', true);

  const wrapQuery = activeWrap === 'daily' ? dailyQuery : activeWrap === 'weekly' ? weeklyQuery : yearlyQuery;
  const report = wrapQuery.data;

  const handleViewWrapped = () => {
    setViewerOpen(true);
  };

  // Extract real stats from wrap report payloads
  const dailyStats = useMemo(() => {
    const intro = dailyQuery.data?.payload?.slides?.find((s: any) => s.type === 'intro');
    const time = dailyQuery.data?.payload?.slides?.find((s: any) => s.type === 'listening-time');
    return {
      tracks: intro?.content?.totalTracks ?? 0,
      minutes: intro?.content?.totalMinutes ?? 0,
      hours: time ? Math.floor((time.content.hours * 60 + time.content.minutes) / 60) : 0,
    };
  }, [dailyQuery.data]);

  const weeklyStats = useMemo(() => {
    const intro = weeklyQuery.data?.payload?.slides?.find((s: any) => s.type === 'intro');
    return {
      tracks: intro?.content?.totalTracks ?? 0,
      artists: intro?.content?.uniqueArtists ?? 0,
      hours: intro?.content?.totalHours ?? 0,
    };
  }, [weeklyQuery.data]);

  const yearlyStats = useMemo(() => {
    const intro = yearlyQuery.data?.payload?.slides?.find((s: any) => s.type === 'intro');
    return {
      tracks: intro?.content?.totalTracks ?? 0,
      artists: intro?.content?.totalArtists ?? 0,
      hours: intro?.content?.totalHours ?? 0,
    };
  }, [yearlyQuery.data]);

  const wrapContent = {
    daily: {
      title: "Your Day in Music",
      description: (
        <>
          You listened to <strong className="text-white">{dailyStats.tracks} songs</strong> today. Here is how your day sounded.
        </>
      ),
      stats: [
        { label: 'Songs', value: dailyStats.tracks || '—', icon: Music },
        { label: 'Minutes', value: dailyStats.minutes || '—', icon: TrendingUp },
        { label: 'Hours', value: dailyStats.hours || '—', icon: Headphones },
      ],
    },
    weekly: {
      title: "This Week's Soundtrack",
      description: (
        <>
          <strong className="text-white">{weeklyStats.tracks} tracks</strong> across <strong className="text-white">{weeklyStats.artists} artists</strong> kept you company this week.
        </>
      ),
      stats: [
        { label: 'Tracks', value: weeklyStats.tracks || '—', icon: Music },
        { label: 'Artists', value: weeklyStats.artists || '—', icon: Headphones },
        { label: 'Hours', value: weeklyStats.hours || '—', icon: TrendingUp },
      ],
    },
    yearly: {
      title: 'Look Back At It',
      description: (
        <>
          An epic year of music. <strong className="text-white">{yearlyStats.tracks} songs</strong> from <strong className="text-white">{yearlyStats.artists} artists</strong> shaped your soundtrack.
        </>
      ),
      stats: [
        { label: 'Songs', value: yearlyStats.tracks || '—', icon: Music },
        { label: 'Artists', value: yearlyStats.artists || '—', icon: Headphones },
        { label: 'Hours', value: yearlyStats.hours || '—', icon: TrendingUp },
      ],
    },
  };

  const content = wrapContent[activeWrap];
  const isLoading = dailyQuery.isLoading || weeklyQuery.isLoading || yearlyQuery.isLoading;

  return (
    <>
      {/* Main Banner Container */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        {/* Background System - Multiple Layers */}
        <div className="relative bg-black min-h-[520px] lg:min-h-[600px] overflow-hidden">
          {/* Layer 1: Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-green-950/30 to-black" />

          {/* Layer 2: Radial glow from center-right */}
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[150px]" />

          {/* Layer 3: Animated gradient orbs */}
          <motion.div
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px]"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/8 rounded-full blur-[130px]"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -20, 0],
              opacity: [0.08, 0.15, 0.08],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Layer 4: Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Content Container */}
          <div className="relative z-10 px-6 lg:px-12 py-12 lg:py-16">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-12 gap-10 items-center">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-7 space-y-8">
                  {/* Animated Top Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 backdrop-blur-xl"
                  >
                    <Sparkles className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-bold text-green-400 uppercase tracking-wider">
                      {activeWrap === 'daily' ? "Today's Recap" : activeWrap === 'weekly' ? 'Weekly Stats' : 'Year in Review'}
                    </span>
                  </motion.div>

                  {/* Main Title */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="space-y-4"
                  >
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95]">
                      {content.title}
                    </h1>
                    <div className="h-1.5 w-24 bg-[#1DB954] rounded-full" />
                    <p className="text-xl md:text-2xl text-gray-400 leading-relaxed max-w-2xl">
                      {content.description}
                    </p>
                  </motion.div>

                  {/* Stats Cards Grid */}
                  <motion.div
                    className="grid grid-cols-3 gap-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                  >
                    {content.stats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        className="relative group"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.03, y: -2 }}
                      >
                        <div className="relative rounded-xl bg-[#121212] border border-white/[0.06] p-4 group-hover:border-white/10 transition-all">
                          <stat.icon className="h-5 w-5 text-[#1DB954] mb-3" />
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">{stat.label}</p>
                          <p className="text-2xl md:text-3xl font-black text-white">
                            {stat.value}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Wrap Type Selector */}
                  <motion.div
                    className="flex flex-wrap gap-3"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.6 }}
                  >
                    <Button
                      onClick={() => setActiveWrap('daily')}
                      variant={activeWrap === 'daily' ? 'default' : 'outline'}
                      className={`relative overflow-hidden transition-all rounded-full ${
                        activeWrap === 'daily'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg shadow-blue-500/20'
                          : 'bg-[#121212] border-white/10 text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                      }`}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Daily
                    </Button>

                    <Button
                      onClick={() => setActiveWrap('weekly')}
                      variant={activeWrap === 'weekly' ? 'default' : 'outline'}
                      className={`relative overflow-hidden transition-all rounded-full ${
                        activeWrap === 'weekly'
                          ? 'bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg shadow-green-500/20'
                          : 'bg-[#121212] border-white/10 text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Weekly
                    </Button>

                    <Button
                      onClick={() => setActiveWrap('yearly')}
                      variant={activeWrap === 'yearly' ? 'default' : 'outline'}
                      className={`relative overflow-hidden transition-all rounded-full ${
                        activeWrap === 'yearly'
                          ? 'bg-rose-700 hover:bg-rose-800 text-white border-0 shadow-lg shadow-rose-900/20'
                          : 'bg-[#121212] border-white/10 text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                      }`}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Yearly
                    </Button>
                  </motion.div>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.8 }}
                  >
                    <Button
                      size="lg"
                      onClick={handleViewWrapped}
                      disabled={isLoading}
                      className="group relative bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold px-10 py-7 text-lg rounded-2xl shadow-xl shadow-green-500/20 hover:shadow-green-500/30 transition-all overflow-hidden disabled:opacity-50"
                    >
                      <div className="relative flex items-center gap-3">
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Play className="h-5 w-5" fill="white" />
                        )}
                        <span>
                          {isLoading
                            ? 'Loading...'
                            : `View ${activeWrap === 'daily' ? 'Today' : activeWrap === 'weekly' ? 'This Week' : 'Your Year'}`}
                        </span>
                        {!isLoading && (
                          <Sparkles className="h-5 w-5" />
                        )}
                      </div>
                    </Button>
                  </motion.div>
                </div>

                {/* Right Column - Visual Feature */}
                <div className="lg:col-span-5 hidden lg:block">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="relative"
                  >
                    <div className="relative">
                      {/* Background glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-rose-500/20 rounded-full blur-[80px]" />

                      <div className="relative">
                        {/* Floating vinyl records */}
                        <div className="relative w-full aspect-square max-w-md mx-auto">
                          {/* Record 1 - Back */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-full border-2 border-white/[0.04] shadow-2xl"
                            animate={{
                              rotate: 360,
                              scale: [1, 1.02, 1],
                            }}
                            transition={{
                              rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                              scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                            }}
                            style={{ transform: 'translateX(20px) translateY(20px)' }}
                          >
                            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-green-900/20 to-transparent border border-white/[0.04]" />
                            <div className="absolute inset-16 rounded-full bg-gradient-to-br from-[#111] to-black border border-white/[0.06]" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-black border border-white/[0.08] flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-[#0a0a0a] border border-white/[0.1]" />
                            </div>
                          </motion.div>

                          {/* Record 2 - Front */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-blue-900/20 to-[#0a0a0a] rounded-full border-2 border-green-500/20 shadow-2xl"
                            animate={{
                              rotate: -360,
                              scale: [1, 1.05, 1],
                            }}
                            transition={{
                              rotate: { duration: 15, repeat: Infinity, ease: 'linear' },
                              scale: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 },
                            }}
                            style={{ transform: 'translateX(-20px) translateY(-20px)' }}
                          >
                            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-green-800/30 to-transparent border border-green-500/10" />
                            <div className="absolute inset-16 rounded-full bg-gradient-to-br from-blue-900/20 to-black border border-green-500/15" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-black border border-green-500/20 flex items-center justify-center">
                              <Disc3 className="w-8 h-8 text-green-400/60" />
                            </div>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 via-transparent to-transparent" />
                          </motion.div>
                        </div>

                        {/* Floating stats badges */}
                        <motion.div
                          className="absolute -top-4 -right-4 px-5 py-4 rounded-2xl bg-gradient-to-br from-green-600 to-blue-600 shadow-xl"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-white" fill="white" />
                            <div>
                              <p className="text-xs text-white/90 font-medium">Top 1%</p>
                              <p className="text-lg font-black text-white">Listener</p>
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          className="absolute -bottom-4 -left-4 px-5 py-4 rounded-2xl bg-[#121212] border border-white/[0.06] shadow-xl"
                          animate={{ y: [0, 8, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        >
                          <div className="flex items-center gap-2">
                            <Radio className="h-5 w-5 text-blue-400" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Active Days</p>
                              <p className="text-lg font-black text-white">{heroData?.totalTracks ? Math.min(365, heroData.totalTracks) : '—'}</p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
        </div>
      </div>

      {/* Stories Viewer */}
      {report && (
        <StoriesViewer
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          timeframe={activeWrap}
          report={report}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
