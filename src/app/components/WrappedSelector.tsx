import { Button } from './ui/button';
import { Play, Sparkles, Calendar, TrendingUp, Music, Headphones, Zap, Radio, Star, Loader2 } from 'lucide-react';
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
      tracks: intro?.content?.totalTracks ?? heroData?.totalTracks ?? 0,
      artists: intro?.content?.totalArtists ?? heroData?.totalArtists ?? 0,
      hours: intro?.content?.totalHours ?? 0,
    };
  }, [yearlyQuery.data, heroData]);

  const isLoading = dailyQuery.isLoading || weeklyQuery.isLoading || yearlyQuery.isLoading;

  const wrapContent = {
    daily: {
      badge: "Today's Recap",
      title: 'Your Day in Music',
      description: (
        <>
          See what you've been listening to <strong className="text-white">today</strong> and discover your daily patterns.
        </>
      ),
      stats: [
        { label: 'Songs', value: dailyStats.tracks > 0 ? dailyStats.tracks.toLocaleString() : '—', icon: Music },
        { label: 'Minutes', value: dailyStats.minutes > 0 ? dailyStats.minutes.toLocaleString() : '—', icon: Zap },
        { label: 'Hours', value: dailyStats.hours > 0 ? dailyStats.hours.toString() : '—', icon: Headphones },
      ]
    },
    weekly: {
      badge: 'Weekly Stats',
      title: "This Week's Soundtrack",
      description: (
        <>
          Your <strong className="text-white">weekly</strong> listening summary — top tracks, artists, and habits.
        </>
      ),
      stats: [
        { label: 'Tracks', value: weeklyStats.tracks > 0 ? weeklyStats.tracks.toLocaleString() : '—', icon: Music },
        { label: 'Artists', value: weeklyStats.artists > 0 ? weeklyStats.artists.toString() : '—', icon: Headphones },
        { label: 'Hours', value: weeklyStats.hours > 0 ? weeklyStats.hours.toString() : '—', icon: Zap },
      ]
    },
    yearly: {
      badge: 'Year in Review',
      title: 'Look Back At It',
      description: (
        <>
          An epic year of music awaits. <strong className="text-white">{yearlyStats.tracks.toLocaleString()} songs</strong> from <strong className="text-white">{yearlyStats.artists} artists</strong> shaped your soundtrack.
        </>
      ),
      stats: [
        { label: 'Songs', value: yearlyStats.tracks.toLocaleString(), icon: Music },
        { label: 'Artists', value: String(yearlyStats.artists), icon: Headphones },
        { label: 'Hours', value: String(yearlyStats.hours), icon: Zap }
      ]
    }
  };

  const content = wrapContent[activeWrap];

  return (
    <>
      {/* Main Banner Container */}
      <div className="relative overflow-hidden rounded-3xl">
        {/* Background System */}
        <div className="relative bg-black min-h-[500px] lg:min-h-[560px] overflow-hidden">

          {/* Base gradient - dark green to black */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#052c1a] via-black to-black"></div>

          {/* Animated gradient orbs */}
          <motion.div
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px]"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          ></motion.div>

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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a2a24] border border-[#1DB954]/40"
                  >
                    <Sparkles className="h-4 w-4 text-[#1DB954]" />
                    <span className="text-xs font-bold text-[#1DB954] uppercase tracking-wider">
                      {content.badge}
                    </span>
                  </motion.div>

                  {/* Main Title */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="space-y-4"
                  >
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[0.95]">
                      {content.title}
                    </h1>
                    <div className="h-2 w-24 bg-[#1DB954] rounded-full"></div>
                    <p className="text-xl md:text-2xl text-[#CCCCCC] leading-relaxed max-w-2xl">
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
                        whileHover={{ scale: 1.05, y: -5 }}
                      >
                        <div className="relative bg-[rgba(25,33,41,0.5)] backdrop-blur-xl rounded-xl p-4 border border-[#2a343d] group-hover:border-[#1DB954]/40 transition-all">
                          <stat.icon className="h-5 w-5 text-[#1DB954] mb-3" />
                          <p className="text-xs text-[#777777] uppercase tracking-wider font-semibold mb-1">{stat.label}</p>
                          <p className="text-2xl md:text-3xl font-black text-[#1DB954]">
                            {isLoading && stat.value === '—' ? (
                              <span className="inline-block w-8 h-8 border-2 border-[#1DB954]/30 border-t-[#1DB954] rounded-full animate-spin" />
                            ) : (
                              stat.value
                            )}
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
                      className={`relative overflow-hidden transition-all rounded-lg ${
                        activeWrap === 'daily'
                          ? 'bg-gradient-to-r from-[#9b0a33] to-[#6b0724] hover:from-[#b00a3c] hover:to-[#7a082a] text-white border-0'
                          : 'bg-[#0a0a0a] border-[#2a343d] text-gray-300 hover:bg-[#111827] hover:text-white'
                      }`}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Daily
                    </Button>

                    <Button
                      onClick={() => setActiveWrap('weekly')}
                      variant={activeWrap === 'weekly' ? 'default' : 'outline'}
                      className={`relative overflow-hidden transition-all rounded-lg ${
                        activeWrap === 'weekly'
                          ? 'bg-gradient-to-r from-[#9b0a33] to-[#6b0724] hover:from-[#b00a3c] hover:to-[#7a082a] text-white border-0'
                          : 'bg-[#0a0a0a] border-[#2a343d] text-gray-300 hover:bg-[#111827] hover:text-white'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Weekly
                    </Button>

                    <Button
                      onClick={() => setActiveWrap('yearly')}
                      variant={activeWrap === 'yearly' ? 'default' : 'outline'}
                      className={`relative overflow-hidden transition-all rounded-lg ${
                        activeWrap === 'yearly'
                          ? 'bg-gradient-to-r from-[#9b0a33] to-[#6b0724] hover:from-[#b00a3c] hover:to-[#7a082a] text-white border-0'
                          : 'bg-[#0a0a0a] border-[#2a343d] text-gray-300 hover:bg-[#111827] hover:text-white'
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
                      disabled={wrapQuery.isLoading}
                      className="group relative bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold px-8 py-6 text-lg rounded-xl shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transition-all overflow-hidden disabled:opacity-50"
                    >
                      <div className="relative flex items-center gap-3">
                        {wrapQuery.isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Play className="h-5 w-5" fill="white" />
                        )}
                        <span>View {activeWrap === 'daily' ? 'Today' : activeWrap === 'weekly' ? 'This Week' : 'Your Year'}</span>
                        <Sparkles className="h-5 w-5" />
                      </div>
                    </Button>
                  </motion.div>
                </div>

                {/* Right Column - Visual Elements */}
                <div className="lg:col-span-5 hidden lg:block">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="relative"
                  >
                    <div className="relative">
                      {/* Background glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-[80px]"></div>

                      {/* Abstract circular graphic */}
                      <div className="relative w-full aspect-square max-w-md mx-auto">
                        <motion.div
                          className="absolute inset-4 rounded-full border-2 border-[#2d46b9]/30"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        ></motion.div>
                        <motion.div
                          className="absolute inset-12 rounded-full border-2 border-[#1DB954]/20"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        ></motion.div>
                        <motion.div
                          className="absolute inset-20 rounded-full border border-[#2d46b9]/40"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        ></motion.div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#1DB954]/20 to-[#2d46b9]/20 blur-xl"></div>
                        </div>
                      </div>

                      {/* Floating badges */}
                      <motion.div
                        className="absolute -top-4 -right-4 px-5 py-4 rounded-2xl bg-gradient-to-br from-green-600 to-blue-600 shadow-xl"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
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
                        className="absolute -bottom-4 -left-4 px-5 py-4 rounded-2xl bg-[#1a222e] border border-blue-500/30 shadow-xl"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      >
                        <div className="flex items-center gap-2">
                          <Radio className="h-5 w-5 text-blue-400" />
                          <div>
                            <p className="text-xs text-gray-400 font-medium">Active Days</p>
                            <p className="text-lg font-black text-white">{yearlyStats.tracks > 0 ? Math.min(365, Math.round(yearlyStats.tracks / 8)) : '—'}</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/40 to-transparent"></div>
        </div>
      </div>

      {/* Stories Viewer */}
      <StoriesViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        timeframe={activeWrap}
        report={report}
        isLoading={wrapQuery.isLoading}
      />
    </>
  );
}
