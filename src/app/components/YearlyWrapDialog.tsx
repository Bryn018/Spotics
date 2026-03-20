import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Sparkles, Music, Clock, Award, Trophy, Crown, Heart, TrendingUp, Zap, Star, Calendar, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useWrap } from '../hooks/useWrap';
import type { YearlyWrapPayload } from '../types';

interface YearlyWrapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function YearlyWrapDialog({ open, onOpenChange }: YearlyWrapDialogProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data } = useWrap('yearly', open);

  const slides = data?.payload.slides ?? [];
  const currentSlideData = slides[currentSlide] ?? slides[0];

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
    if (!slide) return null;

    switch (slide.type) {
      case 'intro':
        return (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-center py-12">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="inline-block mb-6">
              <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Sparkles className="h-20 w-20 text-purple-400" />
              </div>
            </motion.div>

            <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">{slide.title}</h2>
            <p className="text-2xl text-gray-400 mb-12">{slide.subtitle}</p>

            <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
              {[
                { icon: Music, value: slide.content.totalTracks.toLocaleString(), label: 'Songs Played' },
                { icon: Clock, value: slide.content.totalHours.toLocaleString(), label: 'Hours Listened' },
                { icon: Disc, value: slide.content.totalArtists.toLocaleString(), label: 'Artists' },
                { icon: Star, value: slide.content.totalGenres, label: 'Genres' },
              ].map((item) => (
                <motion.div key={item.label} whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8">
                  <item.icon className="h-10 w-10 text-purple-400 mb-4 mx-auto" />
                  <p className="text-4xl font-bold text-white mb-2">{item.value}</p>
                  <p className="text-sm text-gray-400">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'top-artist':
        return (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="text-center py-12">
            <h2 className="text-4xl font-bold text-white mb-12">{slide.title}</h2>

            <div className="max-w-lg mx-auto">
              <div className="relative mb-8">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-60" />
                <ImageWithFallback
                  src={slide.content.image ?? undefined}
                  alt={slide.content.artist}
                  className="relative h-72 w-72 mx-auto rounded-3xl object-cover shadow-2xl ring-4 ring-purple-500/30"
                />
                <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-2xl">
                  <Crown className="h-10 w-10 text-white" />
                </div>
              </div>

              <h3 className="text-4xl font-bold text-white mb-2">{slide.content.artist}</h3>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full mb-8">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-400 font-bold">{slide.content.percentile}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard icon={Music} label="Plays" value={slide.content.plays.toLocaleString()} color="text-purple-400" />
                <StatCard icon={Clock} label="Time" value={`${slide.content.hours}h`} color="text-pink-400" />
                <StatCard icon={TrendingUp} label="Global" value={slide.content.globalRank} color="text-blue-400" />
              </div>
            </div>
          </motion.div>
        );

      case 'top-songs':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">{slide.title}</h2>

            <div className="space-y-3 max-w-2xl mx-auto">
              {slide.content.map((track, index) => (
                <motion.div
                  key={track.rank}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative overflow-hidden rounded-xl p-4 border ${
                    track.rank === 1 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50' : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-4xl font-bold ${track.rank === 1 ? 'text-yellow-400' : 'text-purple-400'} w-12 text-center`}>#{track.rank}</div>
                    <ImageWithFallback src={track.image ?? undefined} alt={track.track} className="h-16 w-16 rounded-lg object-cover shadow-lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1">{track.track}</h3>
                      <p className="text-sm text-gray-400">{track.artist}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">{track.plays}</p>
                      <p className="text-xs text-gray-500">plays</p>
                    </div>
                    {track.rank === 1 && <Trophy className="h-6 w-6 text-yellow-400 absolute top-4 right-4" />}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'genres':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">{slide.title}</h2>

            <div className="max-w-2xl mx-auto">
              <div className="mb-8 text-center">
                <p className="text-gray-400 mb-2">Your top genre was</p>
                <h3 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {slide.content.topGenre}
                </h3>
                <p className="text-2xl text-purple-400">{slide.content.percentage}% of your music</p>
              </div>

              <div className="space-y-4">
                {slide.content.genres.map((genre, index) => (
                  <motion.div key={genre.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">{genre.name}</span>
                      <span className="text-gray-400">{genre.value}%</span>
                    </div>
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${genre.value * 3.125}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${genre.color}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'listening-habits':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">{slide.title}</h2>

            <div className="max-w-lg mx-auto">
              <div className="text-center mb-8">
                <div className="inline-block p-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                  <Sparkles className="h-16 w-16 text-purple-400" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{slide.content.personality}</h3>
                <p className="text-gray-400">{slide.content.description}</p>
              </div>

              <div className="space-y-4 mb-8">
                {slide.content.traits.map((trait, index) => (
                  <div key={trait.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TraitIcon icon={trait.icon} />
                        <span className="text-white font-semibold">{trait.label}</span>
                      </div>
                      <span className="text-purple-400 font-bold">{trait.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${trait.value}%` }} transition={{ duration: 1, delay: index * 0.2 }} className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {slide.content.insights.map((insight, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + index * 0.1 }} className="flex items-center gap-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-3">
                    <div className="h-2 w-2 rounded-full bg-purple-400" />
                    <span className="text-sm text-gray-300">{insight}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'timeline':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">{slide.title}</h2>

            <div className="max-w-2xl mx-auto space-y-6">
              {slide.content.map((item, index) => (
                <motion.div key={item.month} initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.15 }} className="relative">
                  {index !== slide.content.length - 1 && <div className="absolute left-8 top-16 w-0.5 h-full bg-gradient-to-b from-purple-500 to-pink-500" />}

                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg z-10">
                      {item.month}
                    </div>

                    <div className="flex-1 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-4">
                      <h4 className="text-lg font-bold text-white mb-1">{item.highlight}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{item.plays} plays</span>
                        <span>•</span>
                        <span className="text-purple-400">{item.mood}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'achievements':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">{slide.title}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {slide.content.map((achievement, index) => (
                <motion.div key={achievement.title} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.15 }} whileHover={{ scale: 1.05 }} className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 p-6">
                  <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-br ${achievement.color} rounded-full blur-2xl opacity-20`} />
                  <div className="relative">
                    <div className={`inline-block p-3 rounded-full bg-gradient-to-br ${achievement.color} mb-4`}>
                      <AchievementIcon icon={achievement.icon} className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{achievement.title}</h3>
                    <p className="text-sm text-gray-400">{achievement.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'stats':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">{slide.title}</h2>

            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              <StatCard icon={Clock} label="Minutes listened" value={slide.content.totalMinutes.toLocaleString()} color="text-purple-400" gradient="from-purple-500/10 to-pink-500/10" />
              <StatCard icon={Music} label="Songs per day" value={slide.content.songsPerDay.toString()} color="text-pink-400" gradient="from-pink-500/10 to-purple-500/10" />
              <StatCard icon={Award} label="Day streak" value={slide.content.longestStreak.toString()} color="text-orange-400" gradient="from-orange-500/10 to-red-500/10" />
              <StatCard icon={Calendar} label="Top month" value={slide.content.topMonth} color="text-blue-400" gradient="from-blue-500/10 to-cyan-500/10" />
              <StatCard icon={Zap} label="Favorite time" value={slide.content.favoriteTime} color="text-green-400" gradient="from-green-500/10 to-emerald-500/10" fullWidth />
            </div>
          </motion.div>
        );

      case 'thank-you':
        return (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-center py-12">
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} className="inline-block mb-8">
              <div className="p-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                <Heart className="h-20 w-20 text-white" />
              </div>
            </motion.div>

            <h2 className="text-5xl font-bold text-white mb-4">{slide.title}</h2>
            <p className="text-2xl text-gray-400 mb-12">{slide.subtitle}</p>

            <div className="max-w-md mx-auto mb-8">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8">
                <p className="text-sm text-gray-400 mb-2">You ranked</p>
                <p className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {slide.content.yearlyRank}
                </p>
                <p className="text-sm text-gray-400">out of {slide.content.totalListeners} listeners</p>
              </div>
            </div>

            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-6 text-lg">
              <Sparkles className="h-5 w-5 mr-2" />
              {slide.content.shareMessage}
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-950 via-purple-950/30 to-pink-950/30 border-purple-500/30">
        <DialogHeader className="sr-only">
          <DialogTitle>Yearly Wrap</DialogTitle>
        </DialogHeader>

        <div className="relative min-h-[650px]">
          <AnimatePresence mode="wait">{renderSlideContent()}</AnimatePresence>

          {slides.length > 0 && (
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500' : 'w-2 bg-gray-700 hover:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <Button onClick={prevSlide} disabled={currentSlide === 0} variant="outline" className="border-purple-500/30 hover:bg-purple-500/10 disabled:opacity-30">
              Previous
            </Button>

            {currentSlide === slides.length - 1 ? (
              <Button onClick={() => onOpenChange(false)} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Close
              </Button>
            ) : (
              <Button onClick={nextSlide} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Next
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ icon: Icon, label, value, color, gradient = 'from-purple-500/10 to-pink-500/10', fullWidth }: { icon: typeof Music; label: string; value: string; color: string; gradient?: string; fullWidth?: boolean }) {
  return (
    <div className={`${fullWidth ? 'col-span-2' : ''} bg-gradient-to-br ${gradient} border border-purple-500/30 rounded-xl p-6`}>
      <Icon className={`h-8 w-8 ${color} mb-3`} />
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

function TraitIcon({ icon }: { icon: typeof Star }) {
  const Icon = icon;
  return <Icon className="h-5 w-5 text-purple-400" />;
}

function AchievementIcon({ icon, className }: { icon: typeof Trophy; className?: string }) {
  const Icon = icon;
  return <Icon className={className} />;
}
