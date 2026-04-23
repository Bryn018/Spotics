import { Play, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import type { TrackStat } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function TopTracks({ tracks }: { tracks?: TrackStat[] }) {
  const tracksToShow = tracks ?? [];
  const maxPlays = Math.max(...tracksToShow.map((t) => t.plays || 0), 1);

  return (
    <div className="rounded-2xl bg-[#121212] border border-white/[0.06] overflow-hidden">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Top Tracks</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium"
          >
            View All
          </Button>
        </div>
      </div>
      <div className="px-2 pb-2">
        {tracksToShow.slice(0, 10).map((track, index) => (
          <div
            key={track.id}
            className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer"
          >
            {/* Rank */}
            <span className="text-sm font-medium text-gray-500 w-5 text-center group-hover:text-white transition-colors">
              {index + 1}
            </span>

            {/* Album Art */}
            <div className="relative flex-shrink-0 w-14 h-14">
              <ImageWithFallback
                src={track.image ?? undefined}
                alt={track.title}
                gradientSeed={track.id}
                trackId={track.id}
                className="w-full h-full rounded-lg object-cover shadow-lg"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Play className="h-6 w-6 text-white fill-white" />
              </div>
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate group-hover:text-green-400 transition-colors text-[15px]">
                {track.title}
              </p>
              <p className="text-sm text-gray-400 truncate">{track.artist}</p>
            </div>

            {/* Album - hidden on mobile */}
            <div className="hidden md:block w-32 min-w-0">
              <p className="text-sm text-gray-500 truncate">{track.album}</p>
            </div>

            {/* Plays Bar */}
            <div className="hidden sm:flex items-center gap-3 w-28">
              <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1DB954] rounded-full"
                  style={{ width: `${(track.plays / maxPlays) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-8 text-right">{track.plays}</span>
            </div>

            {/* Duration */}
            <span className="text-sm text-gray-500 w-12 text-right tabular-nums">{track.durationLabel}</span>

            {/* Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white h-8 w-8"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {tracksToShow.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">No tracks available</div>
        )}
      </div>
    </div>
  );
}
