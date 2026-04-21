import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Calendar, Clock, Music, Play, TrendingUp, Award, Flame, Zap, Heart, Headphones, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface DailyWrapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DailyWrapDialog({ open, onOpenChange }: DailyWrapDialogProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      type: 'intro',
      title: "Today's Musical Journey",
      subtitle: 'March 20, 2026',
      content: {
        totalTracks: 42,
        totalMinutes: 156,
        topGenre: 'Pop',
        mood: 'Energetic'
      }
    },
    {
      id: 2,
      type: 'top-song',
      title: 'Your Top Song Today',
      content: {
        track: 'Blinding Lights',
        artist: 'The Weeknd',
        plays: 7,
        image: 'https://images.unsplash.com/photo-1616663395403-2e0052b8e595?w=400',
        duration: '3:22'
      }
    },
    {
      id: 3,
      type: 'listening-time',
      title: 'Time Well Spent',
      content: {
        hours: 2,
        minutes: 36,
        comparison: '+23% from yesterday',
        peakHour: '3 PM - 4 PM',
        streak: 7
      }
    },
    {
      id: 4,
      type: 'discovery',
      title: 'New Discovery',
      content: {
        track: 'Shivers',
        artist: 'Ed Sheeran',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        addedToLibrary: true
      }
    }
  ];

  const currentSlideData = slides[currentSlide];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const renderSlideContent = () => {
    const slide = currentSlideData;

    switch (slide.type) {
      case 'intro':
        return (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-8 relative"
          >
            {/* Animated background orbs */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-0 left-1/4 h-64 w-64 bg-blue-500 rounded-full blur-3xl"
            />
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.5, 0.3, 0.5]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute bottom-0 right-1/4 h-64 w-64 bg-cyan-500 rounded-full blur-3xl"
            />

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="inline-block mb-6"
              >
                <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 backdrop-blur-xl border border-blue-400/30 shadow-2xl">
                  <Calendar className="h-20 w-20 text-blue-300" />
                </div>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tight"
              >
                {slide.title}
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full mb-12"
              >
                <Sun className="h-4 w-4 text-blue-300" />
                <p className="text-xl text-blue-200 font-semibold">{slide.subtitle}</p>
              </motion.div>

              <div className="grid grid-cols-2 gap-5 max-w-xl mx-auto">
                {[
                  { icon: Music, value: slide.content.totalTracks, label: 'Tracks Played', gradient: 'from-blue-500 to-cyan-500', delay: 0.5 },
                  { icon: Clock, value: slide.content.totalMinutes, label: 'Minutes', gradient: 'from-cyan-500 to-blue-500', delay: 0.6 },
                  { icon: Zap, value: slide.content.topGenre, label: 'Top Genre', gradient: 'from-purple-500 to-blue-500', delay: 0.7 },
                  { icon: Heart, value: slide.content.mood, label: 'Mood', gradient: 'from-pink-500 to-purple-500', delay: 0.8 }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: item.delay }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="relative group"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity blur-xl`} />
                    <div className="relative bg-gray-900/60 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-6 shadow-xl">
                      <item.icon className="h-10 w-10 text-blue-300 mb-3 mx-auto" />
                      <p className="text-4xl font-black text-white mb-2">{item.value}</p>
                      <p className="text-sm text-blue-200/70 font-medium">{item.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'top-song':
        return (
          <motion.div
            key="top-song"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-8 relative overflow-hidden"
          >
            {/* Animated vinyl record background */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-4 border-blue-500/20"
            />

            <div className="relative z-10">
              <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black text-white mb-12 tracking-tight"
              >
                {slide.title}
              </motion.h2>
              
              <div className="max-w-md mx-auto">
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="relative mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-500 rounded-3xl blur-3xl opacity-60 animate-pulse" />
                  <div className="relative group">
                    <ImageWithFallback
                      src={slide.content.image}
                      alt={slide.content.track}
                      className="relative h-80 w-80 mx-auto rounded-3xl object-cover shadow-2xl ring-4 ring-blue-400/50 group-hover:ring-cyan-400/50 transition-all"
                    />
                    
                    {/* Play button overlay */}
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/50 cursor-pointer hover:scale-110 transition-transform"
                    >
                      <Play className="h-12 w-12 text-white fill-white ml-2" />
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-2">{slide.content.track}</h3>
                  <p className="text-xl text-blue-200 mb-6">{slide.content.artist}</p>
                  
                  <div className="flex items-center justify-center gap-8 text-sm">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full">
                      <TrendingUp className="h-5 w-5 text-blue-300" />
                      <span className="text-blue-200 font-bold text-lg">{slide.content.plays} plays</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-full">
                      <Headphones className="h-5 w-5 text-cyan-300" />
                      <span className="text-cyan-200 font-semibold">{slide.content.duration}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        );

      case 'listening-time':
        return (
          <motion.div
            key="listening-time"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="text-center py-8 relative"
          >
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-4xl font-black text-white mb-12"
            >
              {slide.title}
            </motion.h2>

            <div className="max-w-lg mx-auto space-y-6">
              {/* Main time display */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring" }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl blur-2xl opacity-30" />
                <div className="relative bg-gray-900/80 backdrop-blur-xl border-2 border-blue-400/30 rounded-3xl p-10 shadow-2xl">
                  <Clock className="h-16 w-16 text-blue-300 mb-6 mx-auto" />
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="text-center">
                      <span className="text-7xl md:text-8xl font-black bg-gradient-to-br from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                        {slide.content.hours}
                      </span>
                      <span className="text-4xl text-blue-400 font-bold ml-2">h</span>
                    </div>
                    <span className="text-5xl text-blue-500 font-black">:</span>
                    <div className="text-center">
                      <span className="text-7xl md:text-8xl font-black bg-gradient-to-br from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                        {slide.content.minutes}
                      </span>
                      <span className="text-4xl text-cyan-400 font-bold ml-2">m</span>
                    </div>
                  </div>
                  <p className="text-blue-200/70 font-medium">Total listening time today</p>
                </div>
              </motion.div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-2xl p-5 backdrop-blur-xl"
                >
                  <TrendingUp className="h-8 w-8 text-green-300 mb-3 mx-auto" />
                  <p className="text-lg text-green-300 font-bold">{slide.content.comparison}</p>
                  <p className="text-xs text-green-200/60 mt-1">vs yesterday</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-2xl p-5 backdrop-blur-xl"
                >
                  <Flame className="h-8 w-8 text-orange-300 mb-3 mx-auto" />
                  <p className="text-2xl text-white font-black">{slide.content.streak}</p>
                  <p className="text-xs text-orange-200/60 mt-1">day streak</p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-2xl p-6 backdrop-blur-xl"
              >
                <p className="text-xs text-purple-200/70 mb-2 uppercase tracking-wider font-bold">Peak Listening</p>
                <p className="text-2xl font-black text-white">{slide.content.peakHour}</p>
              </motion.div>
            </div>
          </motion.div>
        );

      case 'discovery':
        return (
          <motion.div
            key="discovery"
            initial={{ opacity: 0, rotate: -5 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 5 }}
            className="text-center py-8 relative overflow-hidden"
          >
            {/* Confetti-like particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -100, opacity: 0 }}
                animate={{ 
                  y: 600, 
                  opacity: [0, 1, 0],
                  x: Math.sin(i) * 200
                }}
                transition={{ 
                  duration: 3, 
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className={`absolute h-3 w-3 rounded-full ${
                  i % 3 === 0 ? 'bg-yellow-400' : i % 3 === 1 ? 'bg-orange-400' : 'bg-pink-400'
                }`}
                style={{ left: `${(i * 5) % 100}%` }}
              />
            ))}

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="inline-block mb-6"
              >
                <div className="p-5 rounded-3xl bg-gradient-to-br from-yellow-500/30 to-orange-500/30 backdrop-blur-xl border border-yellow-400/50 shadow-2xl">
                  <Award className="h-16 w-16 text-yellow-300" />
                </div>
              </motion.div>
              
              <h2 className="text-4xl font-black text-white mb-2">{slide.title}</h2>
              <p className="text-yellow-300 font-bold text-lg mb-8">First time listening!</p>

              <div className="max-w-md mx-auto">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="relative mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 via-orange-500 to-pink-500 rounded-3xl blur-2xl opacity-50 animate-pulse" />
                  <ImageWithFallback
                    src={slide.content.image}
                    alt={slide.content.track}
                    className="relative h-72 w-72 mx-auto rounded-3xl object-cover shadow-2xl ring-4 ring-yellow-400/50"
                  />
                  
                  {/* Sparkle effect */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-4 -right-4"
                  >
                    <Award className="h-12 w-12 text-yellow-400 drop-shadow-lg" />
                  </motion.div>
                </motion.div>

                <h3 className="text-3xl font-black text-white mb-2">{slide.content.track}</h3>
                <p className="text-xl text-gray-300 mb-6">{slide.content.artist}</p>

                {slide.content.addedToLibrary && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.5 }}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-400/50 rounded-full backdrop-blur-xl"
                  >
                    <Heart className="h-6 w-6 text-green-300 fill-green-300" />
                    <span className="text-lg text-green-200 font-bold">Added to your library</span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-black via-blue-950 to-black border-blue-500/30 p-0" aria-describedby={undefined}>
        <DialogHeader className="sr-only">
          <DialogTitle>Daily Wrap</DialogTitle>
        </DialogHeader>

        <div className="relative min-h-[700px] p-8">
          <AnimatePresence mode="wait">
            {renderSlideContent()}
          </AnimatePresence>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-3 mb-8">
            {slides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentSlide(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`h-2.5 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'w-12 bg-gradient-to-r from-blue-400 to-cyan-400 shadow-lg shadow-blue-500/50' 
                    : 'w-2.5 bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              variant="outline"
              className="border-blue-500/30 hover:bg-blue-500/20 disabled:opacity-30 text-blue-300 font-bold px-8 backdrop-blur-xl"
            >
              Previous
            </Button>

            {currentSlide === slides.length - 1 ? (
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30 font-bold px-8"
              >
                Close
              </Button>
            ) : (
              <Button
                onClick={nextSlide}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30 font-bold px-8"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}