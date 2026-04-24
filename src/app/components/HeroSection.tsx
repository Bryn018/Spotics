import { Button } from './ui/button';
import { Play, TrendingUp, Music2, Users, ArrowRight, Headphones, Clock, Calendar, Disc3, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TrackStat } from '../types';

interface HeroSectionProps {
  totalTracks?: number;
  totalArtists?: number;
  totalMinutes?: number;
  topGenre?: string;
  topTracks?: TrackStat[];
  onExploreWrapped?: () => void;
  onPreviewHighlights?: () => void;
}

export function HeroSection({
  totalTracks = 0,
  totalArtists = 0,
  totalMinutes = 0,
  topGenre = 'Music',
  topTracks = [],
  onExploreWrapped,
  onPreviewHighlights,
}: HeroSectionProps) {
  const totalHours = Math.floor(totalMinutes / 60);
  const displayTracks = topTracks.slice(0, 6);

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-2xl">
      {/* Main container with sophisticated gradient background */}
      <div className="relative bg-black overflow-hidden min-h-[600px] lg:min-h-[700px]">
        
        {/* Layered Background System */}
        {/* Layer 1: Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-gray-950 to-teal-950"></div>
        
        {/* Layer 2: Vinyl record background */}
        <div className="absolute inset-0 opacity-[0.08]">
          <img 
            src="https://images.unsplash.com/photo-1670529275215-d952f9633a4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMHR1cm50YWJsZSUyMGRhcmslMjBhZXN0aGV0aWN8ZW58MXx8fHwxNzc0MDM3MjYwfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Vinyl record"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Layer 3: Radial gradient orbs with animation */}
        <motion.div 
          className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[130px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        
        {/* Layer 4: Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
          backgroundSize: '200px 200px'
        }}></div>

        {/* Layer 5: Mesh gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.1),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.1),transparent_50%)]"></div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column - Main Content */}
            <div className="lg:col-span-7 space-y-10">
              
              {/* Animated Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-400/30 backdrop-blur-xl shadow-lg shadow-emerald-500/10">
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-emerald-400"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  ></motion.div>
                  <span className="text-sm font-bold text-emerald-300 tracking-wider">
                    YOUR MUSIC INSIGHTS
                  </span>
                  <div className="px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/30">
                    <span className="text-xs font-bold text-emerald-300">LIVE</span>
                  </div>
                </div>
              </motion.div>

              {/* Main Headline with Gradient */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <div>
                  <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-6">
                    <span className="block text-white mb-2">Look Back</span>
                    <span className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                      At It
                    </span>
                  </h1>
                  <div className="h-1.5 w-32 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"></div>
                </div>
                <p className="text-xl md:text-2xl text-gray-300 max-w-2xl leading-relaxed font-light">
                  Relive your musical journey through <span className="text-emerald-400 font-semibold">{totalTracks.toLocaleString()} tracks</span>, 
                  <span className="text-teal-400 font-semibold"> {totalArtists.toLocaleString()} artists</span>, and countless moments that defined your sound.
                </p>
              </motion.div>

              {/* Stats Grid - Glassmorphic Cards */}
              <motion.div 
                className="grid grid-cols-3 gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                {[
                  { icon: Music2, label: 'Tracks', value: totalTracks.toLocaleString(), color: 'emerald' as const },
                  { icon: Users, label: 'Artists', value: totalArtists.toLocaleString(), color: 'teal' as const },
                  { icon: Clock, label: 'Hours', value: totalHours.toLocaleString(), color: 'cyan' as const }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="relative group"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300"></div>
                    
                    <div className="relative bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl rounded-2xl p-5 border border-white/10 group-hover:border-emerald-400/30 transition-all">
                      <stat.icon className="h-6 w-6 text-emerald-400 mb-3" />
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{stat.label}</p>
                        <p className="text-3xl font-black bg-gradient-to-br from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Section */}
              <motion.div 
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7 }}
              >
                <Button 
                  onClick={onExploreWrapped}
                  className="group relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold px-10 py-7 text-lg rounded-2xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all overflow-hidden"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                  
                  <div className="relative flex items-center gap-3">
                    <Play className="h-6 w-6" fill="white" />
                    <span>Explore Your Wrapped</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Button>

                {/* Secondary action */}
                <div 
                  onClick={onPreviewHighlights}
                  className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-emerald-400/30 transition-all cursor-pointer group"
                >
                  <Headphones className="h-5 w-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                  <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                    Preview Highlights
                  </span>
                </div>
              </motion.div>

              {/* Social Proof */}
              <motion.div 
                className="flex items-center gap-4 text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.9 }}
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 ring-2 ring-black"></div>
                  ))}
                </div>
                <p>
                  Join <span className="text-emerald-400 font-bold">1.2M+</span> music lovers discovering their story
                </p>
              </motion.div>
            </div>

            {/* Right Column - Visual Feature Card */}
            <div className="lg:col-span-5 hidden lg:block">
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {/* Main Feature Card */}
                <div className="relative">
                  {/* Outer glow */}
                  <div className="absolute -inset-8 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30 rounded-[40px] blur-[60px]"></div>
                  
                  {/* Glass Card */}
                  <div className="relative bg-gradient-to-br from-gray-900/70 to-gray-800/50 backdrop-blur-2xl rounded-[32px] p-8 border border-white/10 shadow-2xl overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-full blur-3xl"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 space-y-6">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/20">
                            <Radio className="h-5 w-5 text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg">Your Top Tracks</h3>
                            <p className="text-xs text-gray-500">Most played right now</p>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                          <span className="text-xs text-emerald-400 font-bold">LIVE</span>
                        </div>
                      </div>

                      {/* Album Grid with Hover Effects */}
                      <div className="grid grid-cols-3 gap-3">
                        {displayTracks.length > 0 ? displayTracks.map((track, idx) => (
                          <motion.div 
                            key={track.id}
                            className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/20 overflow-hidden group cursor-pointer relative"
                            whileHover={{ scale: 1.05, rotate: 2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <img 
                              src={track.image || '/placeholder-album.svg'} 
                              alt={track.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-album.svg';
                              }}
                            />
                            
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                              <Play className="h-5 w-5 text-white" fill="white" />
                            </div>
                          </motion.div>
                        )) : [1, 2, 3, 4, 5, 6].map((item) => (
                          <motion.div 
                            key={item}
                            className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border border-emerald-500/20 overflow-hidden group cursor-pointer relative"
                            whileHover={{ scale: 1.05, rotate: 2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="w-full h-full flex items-center justify-center">
                              <Disc3 className="h-10 w-10 text-emerald-400/40 group-hover:text-emerald-400 transition-all group-hover:rotate-180 duration-700" />
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Stats Footer */}
                      <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Time</p>
                          </div>
                          <p className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{totalHours}h</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-gray-500" />
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Top Genre</p>
                          </div>
                          <p className="text-3xl font-black text-white">{topGenre}</p>
                        </div>
                      </div>

                      {/* Achievement Badge */}
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                          <span className="text-2xl">🏆</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">Top 1% Listener</p>
                          <p className="text-xs text-gray-400">You are in the elite club!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Mini Cards */}
                <motion.div 
                  className="absolute -top-6 -left-6 px-4 py-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-white" />
                    <div>
                      <p className="text-xs text-white/90 font-medium">This Week</p>
                      <p className="text-lg font-black text-white">{totalTracks > 0 ? Math.round(totalTracks / 52) : 0}+</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="absolute -bottom-4 -right-6 px-4 py-3 rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-emerald-500/30 shadow-xl"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className="w-2 h-2 rounded-full bg-emerald-400"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    ></motion.div>
                    <p className="text-xs text-gray-400 font-medium">Currently tracking...</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
      </div>
    </div>
  );
}
