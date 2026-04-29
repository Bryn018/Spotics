import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Sparkles, Music, Clock, Award, Trophy, Crown, Heart, TrendingUp, Zap, Star, Calendar, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface YearlyWrapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function YearlyWrapDialog({ open, onOpenChange }: YearlyWrapDialogProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      type: 'intro',
      title: 'Your 2026 Wrapped',
      subtitle: 'A Year in Music',
      content: {
        totalTracks: 12847,
        totalHours: 487,
        totalArtists: 856,
        totalGenres: 42
      }
    },
    {
      id: 2,
      type: 'top-artist',
      title: 'Your #1 Artist',
      content: {
        artist: 'The Weeknd',
        plays: 1247,
        hours: 67,
        minutes: 34,
        image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400',
        percentile: 'Top 1%',
        globalRank: '15,432'
      }
    },
    {
      id: 3,
      type: 'top-songs',
      title: 'Your Top 5 Songs of 2026',
      content: [
        { rank: 1, track: 'Blinding Lights', artist: 'The Weeknd', plays: 234, image: 'https://images.unsplash.com/photo-1616663395403-2e0052b8e595?w=400' },
        { rank: 2, track: 'Levitating', artist: 'Dua Lipa', plays: 198, image: 'https://images.unsplash.com/photo-1672841821756-fc04525771c2?w=400' },
        { rank: 3, track: 'Heat Waves', artist: 'Glass Animals', plays: 187, image: 'https://images.unsplash.com/photo-1770287329282-1fabdc26248b?w=400' },
        { rank: 4, track: 'Stay', artist: 'The Kid LAROI', plays: 165, image: 'https://images.unsplash.com/photo-1563681543778-002ee8f3cd8a?w=400' },
        { rank: 5, track: 'Good 4 U', artist: 'Olivia Rodrigo', plays: 152, image: 'https://images.unsplash.com/photo-1718217028088-a23cb3b277c4?w=400' }
      ]
    },
    {
      id: 4,
      type: 'genres',
      title: 'Your Genre Journey',
      content: {
        topGenre: 'Pop',
        percentage: 32,
        genres: [
          { name: 'Pop', value: 32, color: 'from-purple-500 to-purple-600' },
          { name: 'Hip Hop', value: 24, color: 'from-pink-500 to-pink-600' },
          { name: 'Rock', value: 18, color: 'from-blue-500 to-blue-600' },
          { name: 'Electronic', value: 14, color: 'from-cyan-500 to-cyan-600' },
          { name: 'Indie', value: 12, color: 'from-green-500 to-green-600' }
        ]
      }
    },
    {
      id: 5,
      type: 'listening-habits',
      title: 'Your Listening Personality',
      content: {
        type: 'The Explorer',
        description: 'You love discovering new music and artists',
        traits: [
          { label: 'Variety', value: 92, icon: Star },
          { label: 'Discovery', value: 88, icon: Zap },
          { label: 'Consistency', value: 85, icon: Award }
        ],
        insights: [
          'Discovered 234 new artists',
          'Explored 42 different genres',
          'Listened every single day'
        ]
      }
    },
    {
      id: 6,
      type: 'timeline',
      title: 'Year in Review',
      content: [
        { month: 'Jan', highlight: 'Started the year with R&B', plays: 892, mood: 'Chill' },
        { month: 'Mar', highlight: 'Pop took over', plays: 1045, mood: 'Energetic' },
        { month: 'Jun', highlight: 'Summer vibes with Hip Hop', plays: 1234, mood: 'Upbeat' },
        { month: 'Sep', highlight: 'Rock comeback', plays: 967, mood: 'Intense' },
        { month: 'Dec', highlight: 'Holiday classics', plays: 1156, mood: 'Festive' }
      ]
    },
    {
      id: 7,
      type: 'achievements',
      title: 'Your 2026 Achievements',
      content: [
        { icon: Crown, title: 'Top Listener', desc: "Top 1% of The Weeknd's listeners", color: 'from-yellow-500 to-orange-500' },
        { icon: Trophy, title: 'Music Marathon', desc: '487 hours of pure music', color: 'from-purple-500 to-pink-500' },
        { icon: Sparkles, title: 'Explorer Badge', desc: 'Discovered 234 new artists', color: 'from-blue-500 to-cyan-500' },
        { icon: Heart, title: 'Collector', desc: 'Saved 1,847 tracks', color: 'from-red-500 to-pink-500' }
      ]
    },
    {
      id: 8,
      type: 'stats',
      title: 'By The Numbers',
      content: {
        totalMinutes: 29220,
        songsPerDay: 35,
        longestStreak: 89,
        favoriteTime: '8 PM - 11 PM',
        topMonth: 'June',
        uniquePlays: 12847
      }
    },
    {
      id: 9,
      type: 'thank-you',
      title: 'Thank You for Listening',
      subtitle: "Here's to another year of great music!",
      content: {
        yearlyRank: '#234',
        totalListeners: '10M+',
        shareMessage: 'Share your 2026 Wrapped'
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
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6"
            >
              <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Sparkles className="h-20 w-20 text-purple-400" />
              </div>
            </motion.div>
            
            <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
              {slide.title}
            </h2>
            <p className="text-2xl text-gray-400 mb-12">{slide.subtitle}</p>

            <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8"
              >
                <Music className="h-10 w-10 text-purple-400 mb-4 mx-auto" />
                <p className="text-4xl font-bold text-white mb-2">{slide.content.totalTracks.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Songs Played</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-2xl p-8"
              >
                <Clock className="h-10 w-10 text-pink-400 mb-4 mx-auto" />
                <p className="text-4xl font-bold text-white mb-2">{slide.content.totalHours.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Hours Listened</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-8"
              >
                <Disc className="h-10 w-10 text-blue-400 mb-4 mx-auto" />
                <p className="text-4xl font-bold text-white mb-2">{slide.content.totalArtists.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Artists</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-8"
              >
                <Star className="h-10 w-10 text-green-400 mb-4 mx-auto" />
                <p className="text-4xl font-bold text-white mb-2">{slide.content.totalGenres}</p>
                <p className="text-sm text-gray-400">Genres</p>
              </motion.div>
            </div>
          </motion.div>
        );

      case 'top-artist':
        return (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="text-center py-12"
          >
            <h2 className="text-4xl font-bold text-white mb-12">{slide.title}</h2>
            
            <div className="max-w-lg mx-auto">
              <div className="relative mb-8">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-60"
                />
                <ImageWithFallback
                  src={slide.content.image}
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
                <span className="text-yellow-400 font-bold">{slide.content.percentile} of listeners</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                  <Music className="h-6 w-6 text-purple-400 mb-2 mx-auto" />
                  <p className="text-2xl font-bold text-white mb-1">{slide.content.plays.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Plays</p>
                </div>

                <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-xl p-4">
                  <Clock className="h-6 w-6 text-pink-400 mb-2 mx-auto" />
                  <p className="text-2xl font-bold text-white mb-1">{slide.content.hours}h</p>
                  <p className="text-xs text-gray-400">Time</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
                  <TrendingUp className="h-6 w-6 text-blue-400 mb-2 mx-auto" />
                  <p className="text-xl font-bold text-white mb-1">#{slide.content.globalRank}</p>
                  <p className="text-xs text-gray-400">Global</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'top-songs':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8"
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">{slide.title}</h2>
            
            <div className="space-y-3 max-w-2xl mx-auto">
              {slide.content.map((track, index) => (
                <motion.div
                  key={track.rank}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative overflow-hidden rounded-xl p-4 border ${
                    track.rank === 1 
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50' 
                      : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-4xl font-bold ${
                      track.rank === 1 ? 'text-yellow-400' : 'text-purple-400'
                    } w-12 text-center`}>
                      #{track.rank}
                    </div>

                    <ImageWithFallback
                      src={track.image}
                      alt={track.track}
                      className="h-16 w-16 rounded-lg object-cover shadow-lg"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1">{track.track}</h3>
                      <p className="text-sm text-gray-400">{track.artist}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-white">{track.plays}</p>
                      <p className="text-xs text-gray-500">plays</p>
                    </div>

                    {track.rank === 1 && (
                      <Trophy className="h-6 w-6 text-yellow-400 absolute top-4 right-4" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'genres':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12"
          >
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
                  <motion.div
                    key={genre.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12"
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">{slide.title}</h2>

            <div className="max-w-lg mx-auto">
              <div className="text-center mb-8">
                <div className="inline-block p-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                  <Sparkles className="h-16 w-16 text-purple-400" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{slide.content.type}</h3>
                <p className="text-gray-400">{slide.content.description}</p>
              </div>

              <div className="space-y-4 mb-8">
                {slide.content.traits.map((trait, index) => {
                  const Icon = trait.icon;
                  return (
                    <div key={trait.label}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-purple-400" />
                          <span className="text-white font-semibold">{trait.label}</span>
                        </div>
                        <span className="text-purple-400 font-bold">{trait.value}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${trait.value}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                {slide.content.insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-3"
                  >
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8"
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">{slide.title}</h2>

            <div className="max-w-2xl mx-auto space-y-6">
              {slide.content.map((item, index) => (
                <motion.div
                  key={item.month}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="relative"
                >
                  {index !== slide.content.length - 1 && (
                    <div className="absolute left-8 top-16 w-0.5 h-full bg-gradient-to-b from-purple-500 to-pink-500" />
                  )}
                  
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12"
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">{slide.title}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {slide.content.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.15 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 p-6"
                  >
                    <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-br ${achievement.color} rounded-full blur-2xl opacity-20`} />
                    
                    <div className="relative">
                      <div className={`inline-block p-3 rounded-full bg-gradient-to-br ${achievement.color} mb-4`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{achievement.title}</h3>
                      <p className="text-sm text-gray-400">{achievement.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );

      case 'stats':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12"
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">{slide.title}</h2>

            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
                <Clock className="h-8 w-8 text-purple-400 mb-3" />
                <p className="text-3xl font-bold text-white mb-1">{slide.content.totalMinutes.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Minutes listened</p>
              </div>

              <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-xl p-6">
                <Music className="h-8 w-8 text-pink-400 mb-3" />
                <p className="text-3xl font-bold text-white mb-1">{slide.content.songsPerDay}</p>
                <p className="text-sm text-gray-400">Songs per day avg</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6">
                <Award className="h-8 w-8 text-orange-400 mb-3" />
                <p className="text-3xl font-bold text-white mb-1">{slide.content.longestStreak}</p>
                <p className="text-sm text-gray-400">Day streak record</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
                <Calendar className="h-8 w-8 text-blue-400 mb-3" />
                <p className="text-2xl font-bold text-white mb-1">{slide.content.topMonth}</p>
                <p className="text-sm text-gray-400">Biggest month</p>
              </div>

              <div className="col-span-2 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
                <Zap className="h-8 w-8 text-green-400 mb-3 mx-auto" />
                <p className="text-center">
                  <span className="text-2xl font-bold text-white">{slide.content.favoriteTime}</span>
                </p>
                <p className="text-sm text-gray-400 text-center">Peak listening hours</p>
              </div>
            </div>
          </motion.div>
        );

      case 'thank-you':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="inline-block mb-8"
            >
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-black via-rose-950 to-black border-rose-900/30" aria-describedby={undefined}>
        <DialogHeader className="sr-only">
          <DialogTitle>Yearly Wrap 2026</DialogTitle>
        </DialogHeader>

        <div className="relative min-h-[650px]">
          <AnimatePresence mode="wait">
            {renderSlideContent()}
          </AnimatePresence>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500' 
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
              className="border-purple-500/30 hover:bg-purple-500/10 disabled:opacity-30"
            >
              Previous
            </Button>

            {currentSlide === slides.length - 1 ? (
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Close
              </Button>
            ) : (
              <Button
                onClick={nextSlide}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
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