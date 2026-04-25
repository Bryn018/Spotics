import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play, Sparkles, Clock, Music, Headphones, TrendingUp,
  Calendar, Flame, Star, Zap, Activity, BarChart3,
  Disc3, MoreVertical, ChevronRight, Signal
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Button } from '../components/ui/button';
import { useDashboard, useSyncDashboard, useNowPlaying } from '../hooks/useDashboard';
import { useWrap } from '../hooks/useWrap';
import { StoriesViewer } from '../components/StoriesViewer';
import type { TimeRange, TrackStat, ArtistStat, AlbumStat, GenreStat } from '../types';
import type { Activity as ActivityItem } from '../types';

const RANGE_LABELS: Record<TimeRange, string> = {
  short_term: 'Last 4 Weeks',
  medium_term: 'Last 6 Months',
  long_term: 'All Time',
};

function formatDuration(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatTimeAgo(date: string) {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}


function getGenreColors(genre: string): {bg: string; text: string} {
  const g = genre.toLowerCase();
  if (g.includes('pop')) return {bg: 'bg-[#8B5CF6]/20', text: 'text-[#A78BFA]'};
  if (g.includes('hip hop') || g.includes('rap') || g.includes('hip-hop')) return {bg: 'bg-[#EC4899]/20', text: 'text-[#F472B6]'};
  if (g.includes('rock')) return {bg: 'bg-[#3B82F6]/20', text: 'text-[#60A5FA]'};
  if (g.includes('electronic') || g.includes('edm')) return {bg: 'bg-[#A78BFA]/20', text: 'text-[#C4B5FD]'};
  if (g.includes('indie')) return {bg: 'bg-[#6366F1]/20', text: 'text-[#818CF8]'};
  return {bg: 'bg-[#8B5CF6]/20', text: 'text-[#A78BFA]'};
}

export function Home() {
  const [timeRange, setTimeRange] = useState<TimeRange>('short_term');
  const [activeWrap, setActiveWrap] = useState<'daily' | 'weekly' | 'yearly'>('yearly');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard(timeRange);
  const syncDashboard = useSyncDashboard();
  const { data: nowPlaying } = useNowPlaying(true);
  const { data: dailyWrap, isLoading: isDailyLoading } = useWrap('daily');
  const { data: weeklyWrap, isLoading: isWeeklyLoading } = useWrap('weekly');
  const { data: yearlyWrap, isLoading: isYearlyLoading } = useWrap('yearly');

  useEffect(() => {
    syncDashboard.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
  }, []);

  const payload = dashboardData?.summary?.payload;
  const activities = dashboardData?.activities ?? [];
  const stats = payload?.stats ?? {
    totalMinutes: 0, totalTracks: 0, totalArtists: 0,
    averageDailyMinutes: 0, currentStreak: 0, peakHour: 'N/A', bestDay: 'N/A', songsThisWeek: 0,
  };

  const wrapStats = (() => {
    if (activeWrap === 'daily' && dailyWrap?.payload) {
      const intro = dailyWrap.payload.slides.find(s => s.type === 'intro')?.content;
      return { title: "Today's Recap", tracks: intro?.totalTracks ?? 0, artists: 0, hours: Math.round((intro?.totalMinutes ?? 0) / 60) };
    }
    if (activeWrap === 'weekly' && weeklyWrap?.payload) {
      const intro = weeklyWrap.payload.slides.find(s => s.type === 'intro')?.content;
      return { title: 'Weekly Stats', tracks: intro?.totalTracks ?? 0, artists: intro?.uniqueArtists ?? 0, hours: intro?.totalHours ?? 0 };
    }
    if (activeWrap === 'yearly' && yearlyWrap?.payload) {
      const intro = yearlyWrap.payload.slides.find(s => s.type === 'intro')?.content;
      return { title: 'Year in Review', tracks: intro?.totalTracks ?? 0, artists: intro?.totalArtists ?? 0, hours: intro?.totalHours ?? 0 };
    }
    return { title: 'Year in Review', tracks: stats.totalTracks, artists: stats.totalArtists, hours: Math.floor(stats.totalMinutes / 60) };
  })();

  const genreColors = ['#a855f7', '#ec4899', '#3b82f6', '#f97316', '#22c55e', '#14b8a6', '#f59e0b'];

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-[#1DB954]/20 border-t-[#1DB954] rounded-full animate-spin" />
          <p className="text-[#B3B3B3]">Loading your music data...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px]">
          <svg viewBox="0 0 400 400" className="w-full h-full opacity-20">
            <circle cx="200" cy="200" r="180" fill="none" stroke="#1DB954" strokeWidth="1" opacity="0.1" />
            <circle cx="200" cy="200" r="150" fill="none" stroke="#1DB954" strokeWidth="1" opacity="0.1" />
            <circle cx="200" cy="200" r="120" fill="none" stroke="#1DB954" strokeWidth="1" opacity="0.08" />
            <circle cx="200" cy="200" r="90" fill="none" stroke="#1DB954" strokeWidth="1" opacity="0.08" />
            <circle cx="200" cy="200" r="60" fill="none" stroke="#1DB954" strokeWidth="1" opacity="0.06" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-20">
          <div className="bg-black rounded-3xl p-8 lg:p-12">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-8">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[20px] bg-[#062826] border border-[#1DB954]"
              >
                <Sparkles className="h-4 w-4 text-[#1DB954]" />
                <span className="text-xs font-bold text-[#1DB954] uppercase tracking-wider">Year in Review</span>
              </motion.div>

              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight">
                  <span className="relative inline-block">
                    Look
                    <span className="absolute -bottom-2 left-0 w-[110px] h-1 bg-gradient-to-r from-[#1DB954] to-[#19E68C] rounded-full" />
                  </span>{' '}
                  Back At It
                </h1>
                <p className="text-xl md:text-2xl text-[#B3B3B3] leading-relaxed max-w-2xl">
                  An epic year of music awaits.{' '}
                  <strong className="text-white">{wrapStats.tracks.toLocaleString()} songs</strong> from{' '}
                  <strong className="text-white">{wrapStats.artists.toLocaleString()} artists</strong> shaped your soundtrack.
                </p>
              </motion.div>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-3 gap-4"
              >
                {[
                  { icon: Music, label: 'Songs', value: wrapStats.tracks.toLocaleString() },
                  { icon: Headphones, label: 'Artists', value: wrapStats.artists.toLocaleString() },
                  { icon: Zap, label: 'Hours', value: wrapStats.hours.toLocaleString() },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className="rounded-xl p-6 bg-[#121212] border border-[#282828]"
                  >
                    <stat.icon className="h-5 w-5 text-[#1DB954] mb-3" />
                    <p className="text-xs font-bold text-[#B3B3B3] uppercase tracking-wider">{stat.label}</p>
                    <p className="text-[36px] font-black text-[#1DB954] leading-none">{stat.value}</p>
                  </div>
                ))}
              </motion.div>

              {/* Toggle + CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-4"
              >
                <div className="flex gap-3">
                  {(['daily', 'weekly', 'yearly'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveWrap(t)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        activeWrap === t
                          ? 'bg-[#A6113A] text-white border border-[#A6113A]'
                          : 'bg-[#121212] text-[#B3B3B3] border border-[#282828]'
                      }`}
                    >
                      {t === 'daily' && <Calendar className="h-4 w-4" />}
                      {t === 'weekly' && <TrendingUp className="h-4 w-4" />}
                      {t === 'yearly' && <Sparkles className="h-4 w-4" />}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={() => setDialogOpen(true)}
                  className="bg-gradient-to-r from-[#1DB954] to-[#19E68C] text-white font-bold px-8 py-6 text-lg rounded-xl shadow-lg shadow-[#1DB954]/40 transition-all"
                >
                  <Play className="h-5 w-5 mr-2" fill="white" />
                  {activeWrap === 'daily' ? 'View Today' : activeWrap === 'weekly' ? 'View This Week' : 'View Your Year'}
                  <Sparkles className="h-5 w-5 ml-2" />
                </Button>
              </motion.div>
            </div>

            {/* Right - Decorative + Widgets */}
            <div className="lg:col-span-5 hidden lg:block relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                {/* Floating Top 1% */}
                <div className="absolute -top-4 right-8 px-4 py-3 rounded-2xl bg-[#181D2B] border border-[#2E3B52] shadow-xl">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-[#1DB954]" fill="#1DB954" />
                    <div>
                      <p className="text-xs text-[#B3B3B3]">Top 1%</p>
                      <p className="text-lg font-black text-white">Listener</p>
                    </div>
                  </div>
                </div>

                {/* Floating Active Days */}
                <div className="absolute -bottom-4 right-0 px-4 py-3 rounded-2xl bg-[#181D2B] border border-[#2E3B52] shadow-xl">
                  <div className="flex items-center gap-2">
                    <Signal className="h-5 w-5 text-[#60A5FA]" />
                    <div>
                      <p className="text-xs text-[#B3B3B3]">Active Days</p>
                      <p className="text-lg font-black text-white">{stats.currentStreak > 0 ? stats.currentStreak * 7 : 342}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* ── YOUR MUSIC STATS ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 bg-black">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Music Stats</h2>
            <p className="text-sm text-[#B3B3B3] mt-1">Track your listening habits and discover your musical journey</p>
          </div>
          <div className="flex bg-[#121212] rounded-lg p-1">
            {(['short_term', 'medium_term', 'long_term'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  timeRange === range
                    ? 'bg-[#282828] text-[#1DB954]'
                    : 'text-[#B3B3B3] hover:text-white'
                }`}
              >
                {RANGE_LABELS[range]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {
            [
              { icon: Clock, label: 'Total Listening Time', value: `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`, change: '+12% from last month' },
              { icon: Music, label: 'Tracks Played', value: stats.totalTracks.toLocaleString(), change: '+23% from last month' },
              { icon: Headphones, label: 'Unique Artists', value: stats.totalArtists.toLocaleString(), change: '+8% from last month' },
              { icon: TrendingUp, label: 'Avg. Daily Mins', value: String(stats.averageDailyMinutes), change: '+5% from last month' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl p-6 bg-[#121212] border border-[#282828]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <stat.icon className="h-5 w-5 text-[#1DB954]" />
                </div>
                <p className="text-xs text-[#B3B3B3] mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-xs text-[#1DB954]">{stat.change}</p>
              </motion.div>
            ))}
          </div>
        </section>

      {/* ── TOP ALBUMS ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-8 bg-gradient-to-r from-[#1DB954] to-[#19E68C] rounded-full" />
          <h2 className="text-2xl font-bold text-white">Top Albums</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {(payload?.topAlbums ?? []).slice(0, 5).map((album, i) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-[#121212] border border-[#282828]">
                <img
                  src={album.image || '/placeholder-album.svg'}
                  alt={album.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-album.svg'; }}
                />
                <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-black/60 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">#{i + 1}</span>
                </div>
              </div>
              <h3 className="font-bold text-white text-base truncate">{album.name}</h3>
              <p className="text-xs text-[#B3B3B3] truncate">{album.artist}</p>
              <p className="text-xs text-[#B3B3B3]">{album.plays} plays</p>
            </motion.div>
          ))}
          {(payload?.topAlbums ?? []).length === 0 && (
            <div className="col-span-full text-center py-8 text-[#B3B3B3]">
              <p>No album data available</p>
            </div>
          )}
        </div>
      </section>

      {/* ── TOP TRACKS ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-8 bg-gradient-to-r from-[#3b82f6] to-[#1DB954] rounded-full" />
          <h2 className="text-2xl font-bold text-white">Top Tracks</h2>
        </div>
        <div className="rounded-2xl bg-[#121212] border border-[#282828] overflow-hidden">
          {(payload?.topTracks ?? []).slice(0, 5).map((track, i) => (
            <div
              key={track.id}
              className="flex items-center gap-4 px-4 py-3 hover:bg-[#282828]/50 transition-colors border-b border-[#282828] last:border-b-0"
            >
              <span className="text-sm font-bold text-[#B3B3B3] w-6 text-center">{i + 1}</span>
              <div className="relative flex-shrink-0">
                <img
                  src={track.image || '/placeholder-album.svg'}
                  alt={track.title}
                  className="h-10 w-10 rounded object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-album.svg'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{track.title}</p>
                <p className="text-xs text-[#B3B3B3] truncate">{track.artist}</p>
              </div>
              <div className="hidden sm:block flex-1 min-w-0">
                <p className="text-xs text-[#B3B3B3] truncate">{track.album}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#B3B3B3]">{track.plays}</p>
              </div>
              <div className="text-right w-12">
                <p className="text-xs text-[#B3B3B3]">{track.durationLabel || formatDuration(track.durationMs)}</p>
              </div>
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <Play className="h-4 w-4 text-white" />
              </button>
            </div>
          ))}
          {(payload?.topTracks ?? []).length === 0 && (
            <div className="text-center py-8 text-[#B3B3B3]">
              <p>No tracks available for this timeframe</p>
            </div>
          )}
        </div>
      </section>

      {/* ── TOP ARTISTS ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-8 bg-gradient-to-r from-[#1DB954] to-[#3b82f6] rounded-full" />
          <h2 className="text-2xl font-bold text-white">Top Artists</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {(payload?.topArtists ?? []).slice(0, 6).map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl p-4 bg-[#121212] border border-[#282828]"
              >
                <div className="relative mb-3">
                  <div className="aspect-square rounded-full overflow-hidden bg-[#282828]">
                  <img
                    src={artist.image || '/placeholder-artist.svg'}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-artist.svg'; }}
                  />
                </div>
                <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-black/60 flex items-center justify-center text-white text-sm font-bold">
                  #{i + 1}
                </div>
              </div>
              <h3 className="font-bold text-white text-base truncate mb-1">{artist.name}</h3>
              <p className="text-xs text-[#B3B3B3] mb-2">{artist.plays} plays</p>
              <p className="text-sm text-[#B3B3B3]">{(artist.hours ?? 0).toFixed(1)}h listening</p>
              <div className="flex flex-wrap gap-1 mt-1">
        {artist.genres?.slice(0, 2).map((genre: string) => {
          const {bg, text} = getGenreColors(genre);
          return (
            <span key={genre} className={`${bg} ${text} px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
              {genre}
            </span>
          );
        })}
      </div>
            </motion.div>
          ))}
          {(payload?.topArtists ?? []).length === 0 && (
            <div className="col-span-full text-center py-8 text-[#B3B3B3]">
              <p>No artist data available</p>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-8 bg-gradient-to-r from-[#881337] to-[#f43f5e] rounded-full" />
          <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Now Playing + Quick Stats */}
          <div className="space-y-4">
            {/* Now Playing */}
            <div className="rounded-xl p-4 bg-[#121212] border border-[#282828]">
              {nowPlaying?.isPlaying && nowPlaying.track ? (
                <div className="flex items-center gap-3">
                  <img
                    src={nowPlaying.track.image || '/placeholder-album.svg'}
                    alt={nowPlaying.track.title}
                    className="h-12 w-12 rounded-lg object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-album.svg'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#1DB954] animate-pulse" />
                      <span className="text-xs text-[#1DB954] font-semibold">Now Playing</span>
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{nowPlaying.track.title}</p>
                    <p className="text-xs text-[#B3B3B3] truncate">{nowPlaying.track.artist}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-[#282828] flex items-center justify-center">
                    <Music className="h-5 w-5 text-[#B3B3B3]" />
                  </div>
                <div>
                  <p className="text-sm font-semibold text-white">Nothing playing</p>
                  <p className="text-xs text-[#B3B3B3]">Start listening on Spotify</p>
                </div>
              </div>
            )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 bg-[#121212] border border-[#282828]">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-[#1DB954]" />
                  <span className="text-xs text-[#1DB954] font-bold">+8</span>
                </div>
                <p className="text-xs text-[#B3B3B3]">tracks</p>
                <p className="text-sm font-semibold text-white">Today</p>
                <p className="text-xl font-bold text-white">{stats.songsThisWeek > 0 ? Math.round(stats.songsThisWeek / 7) : 42}</p>
              </div>
              <div className="rounded-xl p-4 bg-[#121212] border border-[#282828]">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-[#1DB954]" />
                  <span className="text-xs text-[#1DB954] font-bold">+24</span>
                </div>
                <p className="text-xs text-[#B3B3B3]">tracks</p>
                <p className="text-sm font-semibold text-white">This Week</p>
                <p className="text-xl font-bold text-white">{stats.songsThisWeek || 312}</p>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2 rounded-2xl bg-[#181D2B] border border-[#2E3B52] overflow-hidden">
            {activities.slice(0, 6).map((activity, i) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#282828]/30 transition-colors border-b border-[#2E3B52] last:border-b-0"
              >
                <img
                  src={activity.metadata?.image || '/placeholder-album.svg'}
                  alt={activity.title}
                  className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-album.svg'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#B3B3B3]">{activity.activity_type === 'track' ? 'Listened to' : activity.activity_type}</p>
                  <p className="text-sm font-semibold text-white truncate">{activity.title}</p>
                  <p className="text-xs text-[#B3B3B3] truncate">{activity.subtitle}</p>
                </div>
                <span className="text-xs text-[#B3B3B3] flex-shrink-0">{formatTimeAgo(activity.occurred_at)}</span>
              </div>
            ))}
          {activities.length === 0 && (
              <div className="text-center py-8 text-[#B3B3B3]">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── YOUR LISTENING SCORE ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
        <div className="rounded-2xl p-6 bg-[#181D2B] border border-[#2E3B52] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#1DB954] to-[#19E68C] flex items-center justify-center">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#B3B3B3]">Your Listening Score</p>
              <p className="text-3xl font-black text-white">{payload?.listeningScore?.toFixed(1) ?? '8.7'}/10</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-[#1DB954]">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-bold">+0.5</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#B3B3B3]">This week</p>
              <p className="text-xs text-[#B3B3B3]">Based on listening time, variety, and engagement</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ANALYTICS ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-8 bg-[#1DB954] rounded-full" />
          <h2 className="text-3xl font-bold text-white">Analytics</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Listening Activity (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart Card */}
            <div className="rounded-2xl p-6 bg-[#181D2B] border border-[#2E3B52]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[#1DB954]" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Listening Activity</h3>
                    <p className="text-xs text-[#B3B3B3]">Your listening time this week</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#1DB954]">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-bold">+12%</span>
                  <span className="text-xs text-[#B3B3B3]">vs last week</span>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Total', value: `${payload?.listeningChart?.reduce((a, b) => a + b.minutes, 0) ?? 0}m` },
                  { label: 'Average', value: `${Math.round((payload?.listeningChart?.reduce((a, b) => a + b.minutes, 0) ?? 0) / 7)}m` },
                  { label: 'Peak Day', value: payload?.listeningChart?.reduce((a, b) => a.minutes > b.minutes ? a : b, payload?.listeningChart[0] ?? { label: 'Sat', minutes: 0 })?.label ?? 'Sat' },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg p-3 bg-[#121212]">
                    <p className="text-xs text-[#B3B3B3] mb-1">{s.label}</p>
                    <p className="text-lg font-bold text-[#1DB954]">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="h-[250px]">
                {(payload?.listeningChart ?? []).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={payload?.listeningChart ?? []}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1DB954" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#1DB954" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis dataKey="label" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} />
                      <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
                        formatter={(value: number) => [`${value}m`, 'Listening Time']}
                      />
                      <Area type="monotone" dataKey="minutes" stroke="#8b5cf6" strokeWidth={2} fill="url(#chartGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-[#B3B3B3]">
                    <p>No chart data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Insights */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-[#2E3B52]" />
                <span className="text-xs font-bold text-[#B3B3B3] uppercase tracking-wider">Weekly Insights</span>
                <div className="flex-1 h-px bg-[#2E3B52]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Flame, label: 'Current Streak', value: `${stats.currentStreak || 7} days`, sub: 'Keep it going!', color: 'from-[#ff7b00] to-[#f97316]' },
                  { icon: Clock, label: 'Most Active Hour', value: stats.peakHour || '8-9 PM', sub: 'Prime listening time', color: 'from-[#f59e0b] to-[#d97706]' },
                  { icon: Calendar, label: 'Best Day', value: stats.bestDay || 'Saturday', sub: 'Weekend vibes', color: 'from-[#8b5cf6] to-[#7c3aed]' },
                  { icon: Music, label: 'Songs This Week', value: String(stats.songsThisWeek || 156), sub: 'Unique tracks', color: 'from-[#a855f7] to-[#9333ea]' },
                ].map((insight, i) => (
                  <div key={insight.label} className="rounded-xl p-4 bg-[#121212] border border-[#282828] flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${insight.color} flex items-center justify-center flex-shrink-0`}>
                      <insight.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-[#B3B3B3]">{insight.label}</p>
                      <p className="text-lg font-bold text-white">{insight.value}</p>
                      <p className="text-xs text-[#B3B3B3]">{insight.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Banner */}
            <div className="rounded-2xl p-5 bg-gradient-to-r from-[#062826] to-[#0a3d2e] border border-[#1DB954] flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#ff7b00] to-[#f97316] flex items-center justify-center flex-shrink-0">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-bold">7-Day Streak Achievement!</h4>
                  <Star className="h-4 w-4 text-[#f59e0b]" fill="#f59e0b" />
                </div>
                <p className="text-sm text-[#B3B3B3]">You've been consistent all week. Keep the momentum going!</p>
                <div className="flex gap-1 mt-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-2 flex-1 rounded-full bg-gradient-to-r from-[#ff7b00] to-[#f97316]" />
                  ))}
                </div>
              </div>
              <div className="rounded-xl px-4 py-3 bg-gradient-to-br from-[#1DB954] to-[#19E68C] shadow-lg shadow-[#1DB954]/20 flex-shrink-0">
                <p className="text-[10px] text-white/80 uppercase font-bold">Bonus</p>
                <p className="text-lg font-black text-white">+50 XP</p>
              </div>
            </div>
          </div>

          {/* Right Column - Genre Distribution (1/3) */}
          <div className="space-y-6">
            <div className="rounded-2xl p-6 bg-[#121212] border border-[#282828]">
              <div className="flex items-center gap-3 mb-6">
                <Music className="h-5 w-5 text-[#1DB954]" />
                <div>
                  <h3 className="text-lg font-bold text-white">Genre Distribution</h3>
                  <p className="text-xs text-[#B3B3B3]">Your most listened genres</p>
                </div>
              </div>

              {/* Top Genre */}
              <div className="rounded-xl p-4 bg-[#181D2B] mb-6">
                <p className="text-xs text-[#B3B3B3] mb-1">Top Genre</p>
                <p className="text-2xl font-bold text-white">{payload?.genreDistribution?.[0]?.name ?? 'Pop'}</p>
              </div>

              {/* Total Plays */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#1DB954]" />
                  <span className="text-xs text-[#B3B3B3]">Total Plays</span>
                </div>
                <span className="text-lg font-bold text-white">
                  {(payload?.genreDistribution ?? []).reduce((a, b) => a + (b.hours || 0), 0).toLocaleString()}
                </span>
              </div>

              {/* Genre Breakdown */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white mb-3">Genre Breakdown</h4>
                {(payload?.genreDistribution ?? []).slice(0, 5).map((genre, i) => (
                  <div key={genre.name}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-6 w-6 rounded bg-[#282828] flex items-center justify-center">
                        <Music className="h-3 w-3" style={{ color: genreColors[i % genreColors.length] }} />
                      </div>
                      <span className="text-sm text-white flex-1">{genre.name}</span>
                      <span className="text-xs text-[#B3B3B3]">{genre.hours || 0} plays</span>
                      <span className="text-xs font-bold text-white w-8 text-right">{genre.percentage}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#282828] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${genre.percentage}%`,
                          background: `linear-gradient(90deg, ${genreColors[i % genreColors.length]}, ${genreColors[i % genreColors.length]}dd)`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {(payload?.genreDistribution ?? []).length === 0 && (
                  <p className="text-sm text-[#B3B3B3]">No genre data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#374151] py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <p className="text-sm text-[#1DB954]">&copy; 2026 Insights</p>
        </div>
      </footer>

      {/* Story Dialog */}
      <StoriesViewer
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        timeframe={activeWrap}
        report={activeWrap === 'daily' ? dailyWrap : activeWrap === 'weekly' ? weeklyWrap : yearlyWrap}
        isLoading={activeWrap === 'daily' ? isDailyLoading : activeWrap === 'weekly' ? isWeeklyLoading : isYearlyLoading}
      />
    </main>
  );
}
