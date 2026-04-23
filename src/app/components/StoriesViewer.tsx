import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { X, Music2, Trophy, Star, Flame, Crown, Sparkles, Heart, Award, Zap, TrendingUp, Clock, Headphones, Share2, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type {
  WrapTimeframe,
  WrapReport,
  DailyWrapPayload,
  WeeklyWrapPayload,
  YearlyWrapPayload,
  IconName,
} from '../types';

interface StoriesViewerProps {
  open: boolean;
  onClose: () => void;
  timeframe: WrapTimeframe;
  report: WrapReport<DailyWrapPayload | WeeklyWrapPayload | YearlyWrapPayload> | null | undefined;
  isLoading: boolean;
}

const iconMap: Record<IconName, typeof Trophy> = {
  trophy: Trophy,
  star: Star,
  flame: Flame,
  crown: Crown,
  sparkles: Sparkles,
  heart: Heart,
  award: Award,
  zap: Zap,
};

const SLIDE_DURATION_MS = 6000;

const SLIDE_GRADIENTS = [
  'from-purple-900 via-indigo-900 to-black',
  'from-rose-900 via-pink-900 to-black',
  'from-emerald-900 via-teal-900 to-black',
  'from-amber-900 via-orange-900 to-black',
  'from-cyan-900 via-blue-900 to-black',
  'from-fuchsia-900 via-violet-900 to-black',
  'from-lime-900 via-green-900 to-black',
  'from-sky-900 via-cyan-900 to-black',
];

function getSlideGradient(index: number) {
  return SLIDE_GRADIENTS[index % SLIDE_GRADIENTS.length];
}

function getSlideImage(slide: any): string | null {
  if (!slide) return null;
  switch (slide.type) {
    case 'top-song':
      return slide.content?.image ?? null;
    case 'top-artist':
      return slide.content?.image ?? null;
    case 'discovery':
      return slide.content?.image ?? null;
    case 'top-tracks':
    case 'top-songs':
      return slide.content?.[0]?.image ?? null;
    default:
      return null;
  }
}

export function StoriesViewer({ open, onClose, timeframe, report, isLoading }: StoriesViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const [showPauseIcon, setShowPauseIcon] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const progressRef = useRef<number>(0);
  const pauseRef = useRef<boolean>(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slides = report?.payload?.slides ?? [];
  const totalSlides = slides.length;

  const goToSlide = useCallback((index: number, dir: number = 1) => {
    if (index < 0) {
      onClose();
      return;
    }
    if (index >= totalSlides) {
      onClose();
      return;
    }
    setDirection(dir);
    setCurrentSlide(index);
    setProgress(0);
    progressRef.current = 0;
    startTimeRef.current = Date.now();
  }, [totalSlides, onClose]);

  const nextSlide = useCallback(() => goToSlide(currentSlide + 1, 1), [currentSlide, goToSlide]);
  const prevSlide = useCallback(() => goToSlide(currentSlide - 1, -1), [currentSlide, goToSlide]);

  // Auto-advance timer
  useEffect(() => {
    if (!open || isPaused || totalSlides === 0) return;

    startTimeRef.current = Date.now();
    progressRef.current = 0;

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / SLIDE_DURATION_MS) * 100, 100);
      progressRef.current = newProgress;
      setProgress(newProgress);

      if (newProgress >= 100) {
        nextSlide();
      } else {
        timerRef.current = requestAnimationFrame(tick);
      }
    };

    timerRef.current = requestAnimationFrame(tick);

    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [open, currentSlide, isPaused, totalSlides, nextSlide]);

  // Reset when opened
  useEffect(() => {
    if (open) {
      setCurrentSlide(0);
      setProgress(0);
      progressRef.current = 0;
      setDirection(0);
      setIsPaused(false);
    }
  }, [open, timeframe]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, nextSlide, prevSlide, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handlePointerDown = () => {
    pauseRef.current = false;
    holdTimerRef.current = setTimeout(() => {
      pauseRef.current = true;
      setIsPaused(true);
      setShowPauseIcon(true);
    }, 200);
  };

  const handlePointerUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (pauseRef.current) {
      setIsPaused(false);
      setShowPauseIcon(false);
      pauseRef.current = false;
    }
  };

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    // If we were holding (paused), just resume on tap release
    if (pauseRef.current) return;

    const clientX = 'touches' in e ? e.changedTouches[0].clientX : e.clientX;
    const width = window.innerWidth;

    if (clientX < width * 0.25) {
      prevSlide();
    } else if (clientX > width * 0.75) {
      nextSlide();
    } else {
      // Center tap: toggle pause
      setIsPaused((p) => !p);
      setShowPauseIcon((p) => !p);
    }
  };

  const handlePanEnd = (_event: any, info: PanInfo) => {
    const threshold = 80;
    if (info.offset.x < -threshold) {
      nextSlide();
    } else if (info.offset.x > threshold) {
      prevSlide();
    } else if (info.offset.y > threshold * 1.5) {
      onClose();
    }
  };

  const handleShare = async () => {
    const text = `Check out my ${timeframe} music wrap on Spotics!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Spotics Wrap', text, url: window.location.href });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${text} ${window.location.href}`);
    }
  };

  const slide = slides[currentSlide];
  const gradient = getSlideGradient(currentSlide);
  const bgImage = useMemo(() => getSlideImage(slide), [slide]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 bg-black select-none"
      style={{ touchAction: 'none' }}
    >
      {/* Full-screen blurred background image */}
      <AnimatePresence mode="wait">
        {bgImage ? (
          <motion.div
            key={`bg-img-${currentSlide}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-0"
          >
            <img
              src={bgImage}
              alt=""
              className="w-full h-full object-cover blur-3xl scale-110 opacity-60"
              draggable={false}
            />
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
        ) : (
          <motion.div
            key={`bg-grad-${currentSlide}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`absolute inset-0 bg-gradient-to-b ${gradient}`}
          />
        )}
      </AnimatePresence>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] z-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Progress bars - Instagram style thin segmented */}
      <div className="absolute top-3 left-0 right-0 z-30 flex gap-1.5 px-3">
        {Array.from({ length: Math.max(totalSlides, 1) }).map((_, i) => (
          <div key={i} className="flex-1 h-[3px] bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              style={{
                width: i < currentSlide ? '100%' : i === currentSlide ? `${progress}%` : '0%',
              }}
              transition={{ duration: 0 }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-0 right-0 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center ring-2 ring-white/20">
            <Music2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight drop-shadow-lg">Spotics</p>
            <p className="text-white/60 text-[10px] uppercase tracking-wider font-medium drop-shadow-md">
              {timeframe === 'daily' ? "Today's Wrap" : timeframe === 'weekly' ? "This Week" : "Year in Review"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-white/20 transition-colors"
          >
            <Share2 className="h-4 w-4 text-white drop-shadow" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4 text-white drop-shadow" />
          </button>
        </div>
      </div>

      {/* Slide content */}
      <motion.div
        className="absolute inset-0 z-20 flex items-center justify-center"
        onClick={handleTap}
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchEnd={handlePointerUp}
        onPanEnd={handlePanEnd}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
      >
        {/* Tap zone indicators (very subtle) */}
        <div className="absolute inset-y-0 left-0 w-[20%] z-0 flex items-center justify-start pl-3 pointer-events-none">
          {currentSlide > 0 && (
            <ChevronLeft className="h-8 w-8 text-white/10" />
          )}
        </div>
        <div className="absolute inset-y-0 right-0 w-[20%] z-0 flex items-center justify-end pr-3 pointer-events-none">
          {currentSlide < totalSlides - 1 && (
            <ChevronRight className="h-8 w-8 text-white/10" />
          )}
        </div>

        {/* Pause indicator */}
        <AnimatePresence>
          {showPauseIcon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
            >
              <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                <Pause className="h-8 w-8 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-md mx-auto px-5">
          {isLoading && (
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full mx-auto mb-4"
              />
              <p className="text-white/60 text-sm">Loading your wrap...</p>
            </div>
          )}

          {!isLoading && !slide && (
            <div className="text-center">
              <p className="text-white/60">No wrap data yet. Keep listening!</p>
            </div>
          )}

          {!isLoading && slide && (
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`${timeframe}-${currentSlide}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="text-center"
              >
                {renderSlide(slide)}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Bottom actions */}
      {totalSlides > 0 && (
        <div className="absolute bottom-6 left-0 right-0 z-30 flex items-center justify-center gap-4">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
          >
            <Share2 className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">Share</span>
          </button>
          <div className="px-3 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
            <p className="text-white/50 text-xs font-medium">
              {currentSlide + 1} / {totalSlides}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function renderSlide(slide: any) {
  switch (slide.type) {
    case 'intro':
      return <IntroSlide slide={slide} />;
    case 'top-song':
      return <TopSongSlide slide={slide} />;
    case 'top-tracks':
      return <TopTracksSlide slide={slide} />;
    case 'top-artist':
      return <TopArtistSlide slide={slide} />;
    case 'listening-time':
      return <ListeningTimeSlide slide={slide} />;
    case 'discovery':
      return <DiscoverySlide slide={slide} />;
    case 'stats':
      return <StatsSlide slide={slide} />;
    case 'achievements':
      return <AchievementsSlide slide={slide} />;
    case 'genres':
      return <GenresSlide slide={slide} />;
    case 'listening-habits':
      return <ListeningHabitsSlide slide={slide} />;
    case 'timeline':
      return <TimelineSlide slide={slide} />;
    case 'top-songs':
      return <TopTracksSlide slide={slide} />;
    case 'thank-you':
      return <ThankYouSlide slide={slide} />;
    default:
      return null;
  }
}

function IntroSlide({ slide }: { slide: any }) {
  const stats = [
    { label: 'Tracks', value: slide.content.totalTracks },
    { label: 'Minutes', value: slide.content.totalMinutes },
    ...(slide.content.totalHours !== undefined ? [{ label: 'Hours', value: slide.content.totalHours }] : []),
    ...(slide.content.uniqueArtists !== undefined ? [{ label: 'Artists', value: slide.content.uniqueArtists }] : []),
    ...(slide.content.totalArtists !== undefined ? [{ label: 'Artists', value: slide.content.totalArtists }] : []),
    ...(slide.content.totalGenres !== undefined ? [{ label: 'Genres', value: slide.content.totalGenres }] : []),
    ...(slide.content.topGenre ? [{ label: 'Top Genre', value: slide.content.topGenre }] : []),
    ...(slide.content.mood ? [{ label: 'Mood', value: slide.content.mood }] : []),
  ];

  return (
    <div className="space-y-8">
      <div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="inline-block p-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 mb-5"
        >
          <Sparkles className="h-10 w-10 text-green-400" />
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight drop-shadow-lg">{slide.title}</h2>
        <p className="text-lg text-white/70 drop-shadow-md">{slide.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
          >
            <p className="text-2xl font-black text-white drop-shadow">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
            <p className="text-xs text-white/50 uppercase tracking-wider font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TopSongSlide({ slide }: { slide: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white/90 uppercase tracking-wider drop-shadow-lg">{slide.title}</h2>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
      >
        <div className="relative mx-auto w-64 h-64">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-blue-500 rounded-3xl blur-2xl opacity-50" />
          <ImageWithFallback
            src={slide.content.image}
            alt={slide.content.track}
            gradientSeed={slide.content.track}
            className="relative w-full h-full rounded-3xl object-cover shadow-2xl ring-2 ring-white/20"
          />
        </div>
      </motion.div>
      <div>
        <h3 className="text-3xl font-black text-white leading-tight drop-shadow-lg">{slide.content.track}</h3>
        <p className="text-lg text-white/70 mt-1 drop-shadow-md">{slide.content.artist}</p>
        <div className="flex items-center justify-center gap-3 mt-5">
          <div className="flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-white text-sm font-bold">{slide.content.plays} plays</span>
          </div>
          {slide.content.duration && (
            <div className="flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-white text-sm">{slide.content.duration}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TopTracksSlide({ slide }: { slide: any }) {
  const tracks = slide.content;
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-white/90 uppercase tracking-wider drop-shadow-lg">{slide.title}</h2>
      <div className="space-y-3">
        {tracks.map((track: any, i: number) => (
          <motion.div
            key={track.rank ?? i}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center gap-3 p-3 rounded-2xl ${
              track.rank === 1 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' : 'bg-black/20 border border-white/5'
            }`}
          >
            <span className={`text-xl font-black w-7 text-center ${track.rank === 1 ? 'text-yellow-400' : 'text-white/30'}`}>
              {track.rank}
            </span>
            <ImageWithFallback
              src={track.image}
              alt={track.track}
              gradientSeed={track.track}
              className="w-12 h-12 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 text-left min-w-0">
              <p className="text-white font-bold truncate text-sm drop-shadow">{track.track}</p>
              <p className="text-white/50 text-xs">{track.artist}</p>
            </div>
            <span className="text-white/60 text-sm font-bold shrink-0">{track.plays}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TopArtistSlide({ slide }: { slide: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white/90 uppercase tracking-wider drop-shadow-lg">{slide.title}</h2>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
      >
        <div className="relative mx-auto w-56 h-56">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-2xl opacity-50" />
          <ImageWithFallback
            src={slide.content.image}
            alt={slide.content.artist}
            gradientSeed={slide.content.artist}
            className="relative w-full h-full rounded-full object-cover shadow-2xl ring-4 ring-white/10"
          />
          <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
            <Crown className="h-6 w-6 text-white" />
          </div>
        </div>
      </motion.div>
      <div>
        <h3 className="text-3xl font-black text-white leading-tight drop-shadow-lg">{slide.content.artist}</h3>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3">
            <p className="text-xl font-black text-white drop-shadow">{slide.content.plays.toLocaleString()}</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider">Plays</p>
          </div>
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3">
            <p className="text-xl font-black text-white drop-shadow">{slide.content.hours}h</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider">Time</p>
          </div>
          {slide.content.percentile && (
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3">
              <p className="text-xl font-black text-yellow-400 drop-shadow">{slide.content.percentile}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Percentile</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ListeningTimeSlide({ slide }: { slide: any }) {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-white/90 uppercase tracking-wider drop-shadow-lg">{slide.title}</h2>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring' }}
        className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
      >
        <Clock className="h-10 w-10 text-green-400 mx-auto mb-4" />
        <div className="flex items-center justify-center gap-1">
          <span className="text-6xl font-black text-white drop-shadow-lg">{slide.content.hours}</span>
          <span className="text-xl text-white/50 font-medium">h</span>
          <span className="text-6xl font-black text-white drop-shadow-lg ml-2">{slide.content.minutes}</span>
          <span className="text-xl text-white/50 font-medium">m</span>
        </div>
        <p className="text-white/40 text-sm mt-2">Total listening time</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black/20 border border-white/5 rounded-xl p-4">
          <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-2" />
          <p className="text-white font-bold text-sm drop-shadow">{slide.content.comparison}</p>
        </div>
        <div className="bg-black/20 border border-white/5 rounded-xl p-4">
          <Flame className="h-5 w-5 text-orange-400 mx-auto mb-2" />
          <p className="text-white font-bold text-sm drop-shadow">{slide.content.streak} day streak</p>
        </div>
        <div className="bg-black/20 border border-white/5 rounded-xl p-4 col-span-2">
          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Peak Listening</p>
          <p className="text-white font-bold drop-shadow">{slide.content.peakHour}</p>
        </div>
      </div>
    </div>
  );
}

function DiscoverySlide({ slide }: { slide: any }) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' }}
        className="inline-block p-4 rounded-3xl bg-gradient-to-br from-yellow-500/30 to-orange-500/30"
      >
        <Sparkles className="h-10 w-10 text-yellow-400" />
      </motion.div>
      <h2 className="text-3xl font-black text-white leading-tight drop-shadow-lg">{slide.title}</h2>
      <div className="relative mx-auto w-56 h-56">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-pink-500 rounded-3xl blur-2xl opacity-40" />
        <ImageWithFallback
          src={slide.content.image}
          alt={slide.content.track}
          gradientSeed={slide.content.track}
          className="relative w-full h-full rounded-3xl object-cover shadow-2xl ring-2 ring-white/10"
        />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white drop-shadow-lg">{slide.content.track}</h3>
        <p className="text-white/70 drop-shadow-md">{slide.content.artist}</p>
      </div>
      {slide.content.addedToLibrary && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full"
        >
          <Heart className="h-4 w-4 text-green-400 fill-green-400" />
          <span className="text-green-400 text-sm font-bold">Added to your library</span>
        </motion.div>
      )}
    </div>
  );
}

function StatsSlide({ slide }: { slide: any }) {
  const content = slide.content;
  const stats = Object.entries(content).map(([key, value]) => ({
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
    value: typeof value === 'number' ? value.toLocaleString() : String(value),
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white/90 uppercase tracking-wider drop-shadow-lg">{slide.title}</h2>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4"
          >
            <p className="text-2xl font-black text-white drop-shadow">{stat.value}</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AchievementsSlide({ slide }: { slide: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white/90 uppercase tracking-wider drop-shadow-lg">{slide.title}</h2>
      <div className="space-y-3">
        {slide.content.map((achievement: any, i: number) => {
          const Icon = iconMap[(achievement.icon as IconName)] ?? Trophy;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-4 bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4"
            >
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${achievement.color} flex items-center justify-center shrink-0 shadow-lg`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-sm drop-shadow">{achievement.title}</p>
                <p className="text-white/50 text-xs">{achievement.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function GenresSlide({ slide }: { slide: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white/90 uppercase tracking-wider drop-shadow-lg">{slide.title}</h2>
      <div className="text-center mb-4">
        <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Your top genre</p>
        <p className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
          {slide.content.topGenre}
        </p>
        <p className="text-purple-400 font-bold text-sm">{slide.content.percentage}% of your music</p>
      </div>
      <div className="space-y-3">
        {slide.content.genres.map((genre: any, i: number) => (
          <motion.div
            key={genre.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-white text-sm font-medium">{genre.name}</span>
              <span className="text-white/50 text-sm">{genre.value}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${genre.value}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className={`h-full rounded-full bg-gradient-to-r ${genre.color}`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ListeningHabitsSlide({ slide }: { slide: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white/90 uppercase tracking-wider drop-shadow-lg">{slide.title}</h2>
      <div className="text-center">
        <div className="inline-block p-4 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 mb-4">
          <Sparkles className="h-10 w-10 text-purple-400" />
        </div>
        <h3 className="text-3xl font-black text-white drop-shadow-lg">{slide.content.personality}</h3>
        <p className="text-white/70 mt-2 text-sm drop-shadow-md">{slide.content.description}</p>
      </div>
      <div className="space-y-4">
        {slide.content.traits.map((trait: any, i: number) => {
          const Icon = iconMap[(trait.icon as IconName)] ?? Star;
          return (
            <div key={trait.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-purple-400" />
                  <span className="text-white text-sm">{trait.label}</span>
                </div>
                <span className="text-purple-400 font-bold text-sm">{trait.value}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${trait.value}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="space-y-2">
        {slide.content.insights.map((insight: string, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="flex items-center gap-2 text-left bg-black/20 rounded-xl p-3"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
            <span className="text-white/70 text-sm">{insight}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TimelineSlide({ slide }: { slide: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white/90 uppercase tracking-wider drop-shadow-lg">{slide.title}</h2>
      <div className="space-y-4">
        {slide.content.map((item: any, i: number) => (
          <motion.div
            key={item.month}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className="flex items-start gap-3"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-lg">
              {item.month}
            </div>
            <div className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-left">
              <p className="text-white font-bold text-sm drop-shadow">{item.highlight}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-white/50">
                <span>{item.plays.toLocaleString()} plays</span>
                <span>•</span>
                <span className="text-purple-400">{item.mood}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ThankYouSlide({ slide }: { slide: any }) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' }}
        className="inline-block p-5 rounded-full bg-gradient-to-br from-green-500/30 to-blue-500/30"
      >
        <Heart className="h-14 w-14 text-green-400" />
      </motion.div>
      <div>
        <h2 className="text-4xl font-black text-white mb-2 leading-tight drop-shadow-lg">{slide.title}</h2>
        <p className="text-lg text-white/70 drop-shadow-md">{slide.subtitle}</p>
      </div>
      <div className="bg-black/20 border border-white/10 rounded-2xl p-6">
        <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Your yearly rank</p>
        <p className="text-3xl font-black text-white drop-shadow">{slide.content.yearlyRank}</p>
        <p className="text-white/40 text-xs mt-1">out of {slide.content.totalListeners} listeners</p>
      </div>
      <p className="text-white/40 text-sm">{slide.content.shareMessage}</p>
    </div>
  );
}
