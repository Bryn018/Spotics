import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, ExternalLink, Music2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { NowPlayingResponse } from '../types';

interface NowPlayingProps {
  nowPlaying?: NowPlayingResponse;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function NowPlaying({ nowPlaying }: NowPlayingProps) {
  const track = nowPlaying?.track;
  const isPlaying = nowPlaying?.isPlaying ?? false;

  if (!track) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl border border-white/10 p-5"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center shrink-0">
            <Music2 className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Nothing playing right now</p>
            <p className="text-gray-500 text-xs mt-0.5">Start listening on Spotify to see it here</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const progressPercent = track.durationMs > 0
    ? Math.min((track.progressMs / track.durationMs) * 100, 100)
    : 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={track.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/70 backdrop-blur-xl border border-white/10 shadow-lg"
      >
        {/* Ambient glow behind artwork */}
        {track.image && (
          <div
            className="absolute inset-0 opacity-20 blur-3xl"
            style={{
              backgroundImage: `url(${track.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}

        <div className="relative z-10 p-5">
          <div className="flex items-center gap-4">
            {/* Album Art */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shadow-md">
                <ImageWithFallback
                  src={track.image}
                  alt={track.album}
                  gradientSeed={track.id}
                  trackId={track.id}
                  className="w-full h-full object-cover"
                />
              </div>
              {isPlaying && (
                <motion.div
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 border-2 border-gray-900 flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </motion.div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {isPlaying ? (
                  <div className="flex items-center gap-0.5">
                    <motion.div
                      className="w-0.5 h-3 bg-green-400 rounded-full"
                      animate={{ height: [6, 12, 6] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-0.5 h-3 bg-green-400 rounded-full"
                      animate={{ height: [12, 6, 12] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                    />
                    <motion.div
                      className="w-0.5 h-3 bg-green-400 rounded-full"
                      animate={{ height: [6, 10, 6] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                  </div>
                ) : (
                  <Pause className="h-3 w-3 text-gray-400" />
                )}
                <span className={`text-xs font-bold uppercase tracking-wider ${isPlaying ? 'text-green-400' : 'text-gray-400'}`}>
                  {isPlaying ? 'Now Playing' : 'Paused'}
                </span>
              </div>

              <h3 className="text-white font-bold text-base truncate leading-tight">
                {track.title}
              </h3>
              <p className="text-gray-400 text-sm truncate mt-0.5">
                {track.artist}
              </p>
            </div>

            {/* Spotify Link */}
            {track.spotifyUrl && (
              <a
                href={track.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-green-500/30 transition-all"
              >
                <ExternalLink className="h-4 w-4 text-gray-400 hover:text-green-400" />
              </a>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                initial={{ width: `${progressPercent}%` }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-500">{formatDuration(track.progressMs)}</span>
              <span className="text-xs text-gray-500">{formatDuration(track.durationMs)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
