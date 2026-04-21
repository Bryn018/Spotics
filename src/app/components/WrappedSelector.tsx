import { Button } from './ui/button';
import { Play, Sparkles, Calendar, TrendingUp, Music, Headphones, Disc3, Radio, Zap, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { DailyWrapDialog } from './DailyWrapDialog';
import { WeeklyWrapDialog } from './WeeklyWrapDialog';
import { YearlyWrapDialog } from './YearlyWrapDialog';
import { ImageWithFallback } from './figma/ImageWithFallback';

import type { DashboardPayload } from '../types';

export function WrappedSelector({ heroData }: { heroData?: DashboardPayload['hero'] }) {
  const [activeWrap, setActiveWrap] = useState<'daily' | 'weekly' | 'yearly'>('yearly');
  const [dailyDialogOpen, setDailyDialogOpen] = useState(false);
  const [weeklyDialogOpen, setWeeklyDialogOpen] = useState(false);
  const [yearlyDialogOpen, setYearlyDialogOpen] = useState(false);

  const handleViewWrapped = () => {
    if (activeWrap === 'daily') {
      setDailyDialogOpen(true);
    } else if (activeWrap === 'weekly') {
      setWeeklyDialogOpen(true);
    } else {
      setYearlyDialogOpen(true);
    }
  };

  // Dynamic content based on selected wrap
  const wrapContent = {
    daily: {
      title: 'Your Day in Music',
      description: (
        <>
          You listened to <strong>47 songs</strong> from <strong>12 artists</strong> today. Not bad.
        </>
      ),
      stats: [
        { label: 'Songs', value: '47', icon: Music },
        { label: 'Artists', value: '12', icon: Headphones },
        { label: 'Minutes', value: '142', icon: Zap }
      ]
    },
    weekly: {
      title: 'This Week\'s Soundtrack',
      description: (
        <>
          <strong>342 tracks</strong> across <strong>87 artists</strong> kept you company this week.
        </>
      ),
      stats: [
        { label: 'Tracks', value: '342', icon: Music },
        { label: 'Artists', value: '87', icon: Headphones },
        { label: 'Hours', value: '18', icon: Zap }
      ]
    },
    yearly: {
      title: 'Look Back At It',
      description: (
        <>
          An epic year of music awaits. <strong>{heroData ? heroData.totalTracks.toLocaleString() : '2,847'} songs</strong> from <strong>{heroData ? heroData.totalArtists : '312'} artists</strong> shaped your soundtrack.
        </>
      ),
      stats: [
        { label: 'Songs', value: heroData ? heroData.totalTracks.toLocaleString() : '2,847', icon: Music },
        { label: 'Artists', value: heroData ? heroData.totalArtists.toString() : '312', icon: Headphones },
        { label: 'Hours', value: heroData ? Math.round(heroData.totalTracks * 3.5 / 60).toString() : '487', icon: Zap }
      ]
    }
  };

  const content = wrapContent[activeWrap];

  return (
    <>
      {/* Main Banner Container */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        {/* Background System - Multiple Layers */}
        <div className="relative bg-black min-h-[500px] lg:min-h-[600px] overflow-hidden">
          
          {/* Layer 1: Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-green-950 to-black"></div>
          
          {/* Layer 2: Abstract wave background */}
          <div className="absolute inset-0 opacity-[0.06]">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1771448233734-087d6a9151a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdyYWRpZW50JTIwd2F2ZSUyMGRhcmt8ZW58MXx8fHwxNzc0MDM3ODI4fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Abstract background"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Layer 3: Animated gradient orbs */}
          <motion.div 
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[120px]"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          ></motion.div>
          <motion.div 
            className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/15 rounded-full blur-[130px]"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -30, 0],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          ></motion.div>

          {/* Layer 4: Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>

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
                    className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/40 backdrop-blur-xl"
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-4 w-4 text-green-400" />
                    </motion.div>
                    <span className="text-sm font-bold text-green-300 uppercase tracking-wider">
                      {activeWrap === 'daily' ? 'Today\'s Recap' : activeWrap === 'weekly' ? 'Weekly Stats' : 'Year in Review'}
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
                    <div className="h-1.5 w-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                    <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl">
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
                        {/* Hover glow */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl blur opacity-0 group-hover:opacity-40 transition duration-300"></div>
                        
                        <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-xl p-4 border border-white/10 group-hover:border-green-400/40 transition-all">
                          <stat.icon className="h-5 w-5 text-green-400 mb-3" />
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">{stat.label}</p>
                          <p className="text-2xl md:text-3xl font-black bg-gradient-to-br from-green-400 to-blue-400 bg-clip-text text-transparent">
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
                      className={`relative overflow-hidden transition-all ${
                        activeWrap === 'daily'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg shadow-blue-500/30'
                          : 'bg-gray-900/60 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-blue-500/50 backdrop-blur-sm'
                      }`}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Daily
                    </Button>
                    
                    <Button
                      onClick={() => setActiveWrap('weekly')}
                      variant={activeWrap === 'weekly' ? 'default' : 'outline'}
                      className={`relative overflow-hidden transition-all ${
                        activeWrap === 'weekly'
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-lg shadow-green-500/30'
                          : 'bg-gray-900/60 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-green-500/50 backdrop-blur-sm'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Weekly
                    </Button>
                    
                    <Button
                      onClick={() => setActiveWrap('yearly')}
                      variant={activeWrap === 'yearly' ? 'default' : 'outline'}
                      className={`relative overflow-hidden transition-all ${
                        activeWrap === 'yearly'
                          ? 'bg-gradient-to-r from-rose-900 to-rose-800 hover:from-rose-950 hover:to-rose-900 text-white border-0 shadow-xl shadow-rose-900/40'
                          : 'bg-gray-900/60 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-green-500/50 backdrop-blur-sm'
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
                      className="group relative bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-10 py-7 text-lg rounded-2xl shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 transition-all overflow-hidden"
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                      
                      <div className="relative flex items-center gap-3">
                        <Play className="h-5 w-5" fill="white" />
                        <span>View {activeWrap === 'daily' ? 'Today' : activeWrap === 'weekly' ? 'This Week' : 'Your Year'}</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Sparkles className="h-5 w-5" />
                        </motion.div>
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
                    {/* Decorative Vinyl Record Stack */}
                    <div className="relative">
                      {/* Background glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 via-blue-500/30 to-rose-900/30 rounded-full blur-[80px]"></div>
                      
                      {/* Main feature card */}
                      <div className="relative">
                        {/* Floating vinyl records */}
                        <div className="relative w-full aspect-square max-w-md mx-auto">
                          {/* Record 1 - Back */}
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full border-4 border-green-500/20 shadow-2xl"
                            animate={{ 
                              rotate: 360,
                              scale: [1, 1.02, 1]
                            }}
                            transition={{ 
                              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                            }}
                            style={{ transform: 'translateX(20px) translateY(20px)' }}
                          >
                            {/* Vinyl grooves */}
                            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-green-900/40 to-gray-900 border border-green-500/10"></div>
                            <div className="absolute inset-16 rounded-full bg-gradient-to-br from-gray-800 to-black border border-green-500/20"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gray-950 border-2 border-green-500/30 flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-black border border-green-500/40"></div>
                            </div>
                          </motion.div>

                          {/* Record 2 - Front */}
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-br from-green-900 via-blue-900 to-gray-900 rounded-full border-4 border-green-400/30 shadow-2xl"
                            animate={{ 
                              rotate: -360,
                              scale: [1, 1.05, 1]
                            }}
                            transition={{ 
                              rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                              scale: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }
                            }}
                            style={{ transform: 'translateX(-20px) translateY(-20px)' }}
                          >
                            {/* Vinyl grooves */}
                            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-green-800/50 to-gray-900 border border-green-400/20"></div>
                            <div className="absolute inset-16 rounded-full bg-gradient-to-br from-blue-900 to-black border border-green-400/30"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gray-950 border-2 border-green-400/50 flex items-center justify-center">
                              <Disc3 className="w-8 h-8 text-green-400" />
                            </div>
                            
                            {/* Reflective highlight */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 via-transparent to-transparent"></div>
                          </motion.div>
                        </div>

                        {/* Floating stats badges */}
                        <motion.div 
                          className="absolute -top-6 -right-6 px-5 py-4 rounded-2xl bg-gradient-to-br from-green-600 to-blue-600 shadow-xl"
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
                          className="absolute -bottom-6 -left-6 px-5 py-4 rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-blue-500/30 shadow-xl"
                          animate={{ y: [0, 10, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        >
                          <div className="flex items-center gap-2">
                            <Radio className="h-5 w-5 text-blue-400" />
                            <div>
                              <p className="text-xs text-gray-400 font-medium">Active Days</p>
                              <p className="text-lg font-black text-white">342</p>
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
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/40 to-transparent"></div>
        </div>
      </div>

      {/* Dialogs */}
      <DailyWrapDialog open={dailyDialogOpen} onOpenChange={setDailyDialogOpen} />
      <WeeklyWrapDialog open={weeklyDialogOpen} onOpenChange={setWeeklyDialogOpen} />
      <YearlyWrapDialog open={yearlyDialogOpen} onOpenChange={setYearlyDialogOpen} />
    </>
  );
}