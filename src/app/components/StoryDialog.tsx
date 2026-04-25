import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Music, Clock, TrendingUp, Award, Heart, Flame, Zap, Star, Trophy, Headphones, Calendar, Disc3 } from 'lucide-react';
import type { DailyWrapPayload, WeeklyWrapPayload, YearlyWrapPayload, WrapTimeframe } from '../types';

interface StoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeframe: WrapTimeframe;
  data: DailyWrapPayload | WeeklyWrapPayload | YearlyWrapPayload | null;
}

export function StoryDialog({ open, onOpenChange, timeframe, data }: StoryDialogProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  const slides = data?.slides ?? [];
  const totalSlides = slides.length;
  const slideDuration = 5000; // 5 seconds per slide

  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
      setProgress(0);
    } else {
      onOpenChange(false);
    }
  }, [currentSlide, totalSlides, onOpenChange]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
      setProgress(0);
    }
  }, [currentSlide]);

  // Auto-advance slides like Instagram stories
  useEffect(() => {
    if (!open || totalSlides === 0) return;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + (100 / (slideDuration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [open, currentSlide, totalSlides, nextSlide]);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentSlide(0);
      setProgress(0);
    }
  }, [open]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    if (x < width * 0.3) {
      prevSlide();
    } else if (x > width * 0.7) {
      nextSlide();
    }
  };

  if (!data || slides.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full max-w-[420px] h-[90vh] max-h-[850px] bg-gradient-to-br from-black via-gray-900 to-black border-gray-800 p-0 shadow-2xl" aria-describedby={undefined}>
          <DialogHeader className="sr-only">
            <DialogTitle>{timeframe} Wrap</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center min-h-[600px] p-8">
            <div className="text-center">
              <Disc3 className="h-16 w-16 text-gray-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400">No {timeframe} data available yet.</p>
              <p className="text-gray-600 text-sm mt-2">Listen to more music and check back soon!</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const currentSlideData = slides[currentSlide];

  const renderSlideContent = () => {
    if (!currentSlideData) return null;
    const slide = currentSlideData as any;

    // Intro slide
    if (slide.type === 'intro') {
      return (
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="flex flex-col items-center justify-center h-full text-center p-6"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30">
              <Star className="h-4 w-4 text-green-400" />
              <span className="text-sm font-bold text-green-300 uppercase tracking-wider">{timeframe} Recap</span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-black text-white mb-3"
          >
            {slide.title}
          </motion.h2>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-300 mb-8"
          >
            {slide.subtitle}
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4 w-full max-w-sm"
          >
            {Object.entries(slide.content).map(([key, value], idx) => (
              <motion.div
                key={key}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4"
              >
                <p className="text-2xl font-black text-white">{String(value)}</p>
                <p className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      );
    }

    // Top song / top artist slide
    if (slide.type === 'top-song' || slide.type === 'top-artist') {
      const content = slide.content;
      return (
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="flex flex-col items-center justify-center h-full text-center p-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <Trophy className="h-10 w-10 text-yellow-400 mx-auto" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-6"
          >
            {slide.title}
          </motion.h2>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="relative mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-blue-500 rounded-3xl blur-2xl opacity-30" />
            <img
              src={content.image || '/placeholder-album.svg'}
              alt={content.track || content.artist}
              className="relative h-64 w-64 rounded-3xl object-cover shadow-2xl ring-4 ring-white/10"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-album.svg'; }}
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center shadow-xl"
            >
              <Play className="h-8 w-8 text-white fill-white ml-1" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-2xl font-black text-white mb-1">{content.track || content.artist}</h3>
            <p className="text-lg text-gray-300 mb-4">{content.artist}</p>
            
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm font-bold text-green-300">{content.plays} plays</span>
              </div>
              {content.duration && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-bold text-blue-300">{content.duration}</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      );
    }

    // Listening time slide
    if (slide.type === 'listening-time') {
      const content = slide.content;
      return (
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="flex flex-col items-center justify-center h-full text-center p-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <Clock className="h-10 w-10 text-blue-400 mx-auto" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-8"
          >
            {slide.title}
          </motion.h2>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl blur-2xl opacity-20" />
            <div className="relative bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
              <div className="flex items-center justify-center gap-2">
                <span className="text-6xl md:text-7xl font-black text-white">{content.hours}</span>
                <span className="text-2xl text-gray-400 font-bold">h</span>
                <span className="text-6xl md:text-7xl font-black text-white">{content.minutes}</span>
                <span className="text-2xl text-gray-400 font-bold">m</span>
              </div>
              <p className="text-gray-400 mt-2">Total listening time</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4 w-full max-w-sm"
          >
            <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-4">
              <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-green-300">{content.comparison}</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-400/20 rounded-xl p-4">
              <Flame className="h-5 w-5 text-orange-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-orange-300">{content.streak} day streak</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-400/20 rounded-xl p-4 col-span-2">
              <Zap className="h-5 w-5 text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-purple-300">Peak hour: {content.peakHour}</p>
            </div>
          </motion.div>
        </motion.div>
      );
    }

    // Discovery slide
    if (slide.type === 'discovery') {
      const content = slide.content;
      return (
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, rotate: -5 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 5 }}
          className="flex flex-col items-center justify-center h-full text-center p-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <Award className="h-10 w-10 text-yellow-400 mx-auto" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-2"
          >
            {slide.title}
          </motion.h2>
          <p className="text-yellow-300 font-medium mb-6">First time listening!</p>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="relative mb-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl blur-2xl opacity-20" />
            <img
              src={content.image || '/placeholder-album.svg'}
              alt={content.track}
              className="relative h-56 w-56 rounded-3xl object-cover shadow-2xl ring-4 ring-yellow-400/30"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-album.svg'; }}
            />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-xl font-black text-white mb-1">{content.track}</h3>
            <p className="text-gray-300 mb-4">{content.artist}</p>
            
            {content.addedToLibrary && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full">
                <Heart className="h-4 w-4 text-green-400 fill-green-400" />
                <span className="text-sm font-bold text-green-300">Added to your library</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      );
    }

    // Top tracks slide (weekly / yearly)
    if (slide.type === 'top-tracks' || slide.type === 'top-songs') {
      const tracks = slide.content;
      return (
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="flex flex-col items-center justify-center h-full text-center p-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <Music className="h-10 w-10 text-green-400 mx-auto" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-6"
          >
            {slide.title}
          </motion.h2>

          <div className="w-full max-w-sm space-y-3">
            {tracks.map((track: any, idx: number) => (
              <motion.div
                key={track.rank}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-3"
              >
                <span className="text-lg font-black text-gray-500 w-6">{track.rank}</span>
                <img
                  src={track.image || '/placeholder-album.svg'}
                  alt={track.track}
                  className="h-12 w-12 rounded-lg object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-album.svg'; }}
                />
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-white">{track.track}</p>
                  <p className="text-xs text-gray-400">{track.artist}</p>
                </div>
                <span className="text-xs text-green-400 font-bold">{track.plays} plays</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      );
    }

    // Stats slide
    if (slide.type === 'stats') {
      const content = slide.content;
      return (
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="flex flex-col items-center justify-center h-full text-center p-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <TrendingUp className="h-10 w-10 text-blue-400 mx-auto" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-6"
          >
            {slide.title}
          </motion.h2>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-4 w-full max-w-sm"
          >
            {Object.entries(content).map(([key, value], idx) => (
              <motion.div
                key={key}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4"
              >
                <p className="text-xl font-black text-white">{String(value)}</p>
                <p className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      );
    }

    // Achievements slide
    if (slide.type === 'achievements') {
      const achievements = slide.content;
      return (
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="flex flex-col items-center justify-center h-full text-center p-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <Trophy className="h-10 w-10 text-yellow-400 mx-auto" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-6"
          >
            {slide.title}
          </motion.h2>

          <div className="w-full max-w-sm space-y-3">
            {achievements.map((achievement: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex items-center gap-3 bg-gradient-to-r from-gray-800/50 to-gray-700/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4"
              >
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${achievement.color} flex items-center justify-center`}>
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-white">{achievement.title}</p>
                  <p className="text-xs text-gray-400">{achievement.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      );
    }

    // Genres slide
    if (slide.type === 'genres') {
      const content = slide.content;
      return (
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="flex flex-col items-center justify-center h-full text-center p-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <Music className="h-10 w-10 text-purple-400 mx-auto" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-2"
          >
            {slide.title}
          </motion.h2>
          <p className="text-purple-300 font-medium mb-6">{content.topGenre} • {content.percentage}%</p>

          <div className="w-full max-w-sm space-y-3">
            {content.genres.map((genre: any, idx: number) => (
              <motion.div
                key={genre.name}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-sm font-bold text-white w-20 text-right">{genre.name}</span>
                <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${genre.value}%` }}
                    transition={{ delay: 0.5 + idx * 0.1, duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: genre.color }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-10">{genre.value}%</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      );
    }

    // Timeline slide
    if (slide.type === 'timeline') {
      const timeline = slide.content;
      return (
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="flex flex-col items-center justify-center h-full text-center p-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <Calendar className="h-10 w-10 text-blue-400 mx-auto" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-6"
          >
            {slide.title}
          </motion.h2>

          <div className="w-full max-w-sm space-y-4">
            {timeline.map((month: any, idx: number) => (
              <motion.div
                key={month.month}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex items-center gap-4 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-sm font-black text-white">{month.month}</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-white">{month.plays} plays</p>
                  <p className="text-xs text-gray-400">{month.highlight}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${month.mood === 'Energetic' ? 'bg-orange-500/20 text-orange-300' : month.mood === 'Chill' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>
                  {month.mood}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      );
    }

    // Listening habits / personality slide
    if (slide.type === 'listening-habits') {
      const content = slide.content;
      return (
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="flex flex-col items-center justify-center h-full text-center p-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <Headphones className="h-10 w-10 text-green-400 mx-auto" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-2"
          >
            {slide.title}
          </motion.h2>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-2xl p-6 mb-6 w-full max-w-sm"
          >
            <h3 className="text-3xl font-black text-white mb-2">{content.personality}</h3>
            <p className="text-gray-300">{content.description}</p>
          </motion.div>

          <div className="w-full max-w-sm space-y-2">
            {content.traits.map((trait: any, idx: number) => (
              <motion.div
                key={trait.label || idx}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-3"
              >
                <Zap className="h-4 w-4 text-green-400" />
                <div className="flex-1 text-left">
                  <span className="text-sm text-white font-medium">{trait.label}</span>
                  <span className="text-sm text-gray-400 ml-2">{trait.value}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {content.insights && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4 bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 w-full max-w-sm"
            >
              <p className="text-sm text-gray-300 italic">"{content.insights}"</p>
            </motion.div>
          )}
        </motion.div>
      );
    }

    // Thank you slide
    if (slide.type === 'thank-you') {
      const content = slide.content;
      return (
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          className="flex flex-col items-center justify-center h-full text-center p-6"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-6"
          >
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-green-500/30">
              <Heart className="h-12 w-12 text-white fill-white" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-black text-white mb-2"
          >
            {slide.title}
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 mb-8"
          >
            {slide.subtitle}
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 w-full max-w-sm"
          >
            <p className="text-sm text-gray-400 mb-2">Your Rank</p>
            <p className="text-4xl font-black text-white mb-2">{content.yearlyRank}</p>
            <p className="text-sm text-gray-500">out of {content.totalListeners} listeners</p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-green-400 font-medium mt-6"
          >
            {content.shareMessage}
          </motion.p>
        </motion.div>
      );
    }

    // Default fallback
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Unknown slide type: {slide.type}</p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[420px] h-[90vh] max-h-[850px] overflow-hidden bg-black border-gray-800 p-0 rounded-2xl shadow-2xl" aria-describedby={undefined}>
        <DialogHeader className="sr-only">
          <DialogTitle>{timeframe} Wrap</DialogTitle>
        </DialogHeader>

        <div className="relative h-full flex flex-col">
          {/* Progress bars at top */}
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-3 pt-4">
            {slides.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-100"
                  style={{
                    width: index < currentSlide ? '100%' : index === currentSlide ? `${progress}%` : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Slide content with tap areas */}
          <div className="flex-1 relative" onClick={handleTap}>
            <AnimatePresence mode="wait">
              {renderSlideContent()}
            </AnimatePresence>
          </div>

          {/* Navigation dots */}
          {totalSlides > 1 && (
            <div className="flex justify-center gap-2 py-4">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => { setCurrentSlide(index); setProgress(0); }}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide ? 'w-6 bg-white' : 'w-2 bg-gray-600'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
