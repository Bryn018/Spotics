import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { TrendingUp, Music, Clock, Award, Flame, Star, Trophy, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface WeeklyWrapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WeeklyWrapDialog({ open, onOpenChange }: WeeklyWrapDialogProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      type: 'intro',
      title: "This Week's Soundtrack",
      subtitle: 'March 14 - March 20, 2026',
      content: {
        totalTracks: 312,
        totalHours: 18,
        totalMinutes: 42,
        uniqueArtists: 87,
        topGenre: 'Pop & Hip Hop'
      }
    },
    {
      id: 2,
      type: 'top-tracks',
      title: 'Your Top 3 Tracks',
      content: [
        {
          rank: 1,
          track: 'Blinding Lights',
          artist: 'The Weeknd',
          plays: 34,
          image: 'https://images.unsplash.com/photo-1616663395403-2e0052b8e595?w=400'
        },
        {
          rank: 2,
          track: 'Levitating',
          artist: 'Dua Lipa',
          plays: 28,
          image: 'https://images.unsplash.com/photo-1672841821756-fc04525771c2?w=400'
        },
        {
          rank: 3,
          track: 'Heat Waves',
          artist: 'Glass Animals',
          plays: 24,
          image: 'https://images.unsplash.com/photo-1770287329282-1fabdc26248b?w=400'
        }
      ]
    },
    {
      id: 3,
      type: 'top-artist',
      title: 'Artist of the Week',
      content: {
        artist: 'The Weeknd',
        plays: 89,
        hours: 5,
        minutes: 34,
        image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400',
        growth: '+45%'
      }
    },
    {
      id: 4,
      type: 'stats',
      title: 'Week in Numbers',
      content: {
        dailyAverage: 44.5,
        peakDay: 'Saturday',
        peakDayTracks: 67,
        longestSession: '3h 24m',
        discoveries: 12,
        streak: 7
      }
    },
    {
      id: 5,
      type: 'achievements',
      title: 'Weekly Achievements',
      content: [
        { icon: Trophy, title: 'Music Marathon', desc: 'Listened for 18+ hours', color: 'from-yellow-500 to-orange-500' },
        { icon: Star, title: 'Variety King', desc: 'Explored 87 artists', color: 'from-purple-500 to-pink-500' },
        { icon: Flame, title: 'Perfect Week', desc: '7-day listening streak', color: 'from-red-500 to-orange-500' }
      ]
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <div className="mb-8">
              <div className="inline-block p-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-6">
                <TrendingUp className="h-16 w-16 text-green-400" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">{slide.title}</h2>
              <p className="text-xl text-gray-400">{slide.subtitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
                <Music className="h-8 w-8 text-green-400 mb-3 mx-auto" />
                <p className="text-3xl font-bold text-white mb-1">{slide.content.totalTracks}</p>
                <p className="text-sm text-gray-400">Tracks Played</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl p-6">
                <Clock className="h-8 w-8 text-emerald-400 mb-3 mx-auto" />
                <p className="text-3xl font-bold text-white mb-1">{slide.content.totalHours}h {slide.content.totalMinutes}m</p>
                <p className="text-sm text-gray-400">Listening Time</p>
              </div>

              <div className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-xl p-6">
                <Users className="h-8 w-8 text-teal-400 mb-3 mx-auto" />
                <p className="text-3xl font-bold text-white mb-1">{slide.content.uniqueArtists}</p>
                <p className="text-sm text-gray-400">Unique Artists</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
                <Award className="h-8 w-8 text-cyan-400 mb-3 mx-auto" />
                <p className="text-lg font-bold text-white mb-1">{slide.content.topGenre}</p>
                <p className="text-sm text-gray-400">Top Genres</p>
              </div>
            </div>
          </motion.div>
        );

      case 'top-tracks':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="py-8"
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">{slide.title}</h2>
            
            <div className="space-y-4 max-w-xl mx-auto">
              {slide.content.map((track, index) => (
                <motion.div
                  key={track.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative overflow-hidden rounded-xl p-4 border ${
                    track.rank === 1 
                      ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/40' 
                      : track.rank === 2
                      ? 'bg-gradient-to-br from-gray-500/20 to-gray-600/20 border-gray-500/40'
                      : 'bg-gradient-to-br from-orange-700/20 to-orange-800/20 border-orange-700/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-4xl font-bold ${
                      track.rank === 1 ? 'text-yellow-400' : track.rank === 2 ? 'text-gray-400' : 'text-orange-600'
                    }`}>
                      #{track.rank}
                    </div>

                    <ImageWithFallback
                      src={track.image}
                      alt={track.track}
                      className="h-20 w-20 rounded-lg object-cover shadow-lg"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1">{track.track}</h3>
                      <p className="text-sm text-gray-400 mb-2">{track.artist}</p>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-green-400 font-semibold">{track.plays} plays</span>
                      </div>
                    </div>

                    {track.rank === 1 && (
                      <Trophy className="h-8 w-8 text-yellow-400 absolute top-4 right-4" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'top-artist':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <h2 className="text-3xl font-bold text-white mb-8">{slide.title}</h2>
            
            <div className="max-w-md mx-auto">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl blur-2xl opacity-50"></div>
                <ImageWithFallback
                  src={slide.content.image}
                  alt={slide.content.artist}
                  className="relative h-64 w-64 mx-auto rounded-2xl object-cover shadow-2xl ring-4 ring-green-500/30"
                />
                <div className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-xl">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              </div>

              <h3 className="text-3xl font-bold text-white mb-6">{slide.content.artist}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
                  <Music className="h-6 w-6 text-green-400 mb-2 mx-auto" />
                  <p className="text-2xl font-bold text-white mb-1">{slide.content.plays}</p>
                  <p className="text-xs text-gray-400">Plays</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <Clock className="h-6 w-6 text-emerald-400 mb-2 mx-auto" />
                  <p className="text-2xl font-bold text-white mb-1">{slide.content.hours}h {slide.content.minutes}m</p>
                  <p className="text-xs text-gray-400">Time</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 font-semibold">{slide.content.growth} from last week</span>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'stats':
        return (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="py-8"
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">{slide.title}</h2>

            <div className="max-w-2xl mx-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
                  <p className="text-sm text-gray-400 mb-2">Daily Average</p>
                  <p className="text-3xl font-bold text-white">{slide.content.dailyAverage}</p>
                  <p className="text-xs text-gray-500">tracks per day</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
                  <p className="text-sm text-gray-400 mb-2">Peak Day</p>
                  <p className="text-3xl font-bold text-white">{slide.content.peakDay}</p>
                  <p className="text-xs text-gray-500">{slide.content.peakDayTracks} tracks</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Longest Session</p>
                    <p className="text-2xl font-bold text-white">{slide.content.longestSession}</p>
                  </div>
                  <Clock className="h-10 w-10 text-purple-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
                  <Award className="h-8 w-8 text-yellow-400 mb-2 mx-auto" />
                  <p className="text-2xl font-bold text-white text-center mb-1">{slide.content.discoveries}</p>
                  <p className="text-xs text-gray-400 text-center">New Discoveries</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6">
                  <Flame className="h-8 w-8 text-orange-400 mb-2 mx-auto" />
                  <p className="text-2xl font-bold text-white text-center mb-1">{slide.content.streak}</p>
                  <p className="text-xs text-gray-400 text-center">Day Streak</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'achievements':
        return (
          <motion.div
            initial={{ opacity: 0, rotate: -5 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 5 }}
            className="py-12"
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">{slide.title}</h2>

            <div className="max-w-lg mx-auto space-y-4">
              {slide.content.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15 }}
                    className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${achievement.color}/20 border border-opacity-40 p-6`}
                    style={{ borderColor: achievement.color }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${achievement.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{achievement.title}</h3>
                        <p className="text-sm text-gray-400">{achievement.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-black via-green-950 to-black border-green-500/30" aria-describedby={undefined}>
        <DialogHeader className="sr-only">
          <DialogTitle>Weekly Wrap</DialogTitle>
        </DialogHeader>

        <div className="relative min-h-[600px]">
          <AnimatePresence mode="wait">
            {renderSlideContent()}
          </AnimatePresence>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'w-8 bg-gradient-to-r from-green-500 to-emerald-500' 
                    : 'w-2 bg-gray-700 hover:bg-gray-600'
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
              className="border-green-500/30 hover:bg-green-500/10 disabled:opacity-30"
            >
              Previous
            </Button>

            {currentSlide === slides.length - 1 ? (
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                Close
              </Button>
            ) : (
              <Button
                onClick={nextSlide}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
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