import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Play, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import type { TrackStat } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function TopTracks({ tracks }: { tracks?: TrackStat[] }) {
  const tracksToShow = tracks ?? [];
  const maxPlays = Math.max(...tracksToShow.map((t) => t.plays || 0), 1);

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-bold text-white">Top Tracks</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-white/5"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {tracksToShow.slice(0, 10).map((track, index) => (
            <div
              key={track.id}
              className="group flex items-center gap-4 px-6 py-3 hover:bg-gradient-to-r hover:from-purple-900/20 hover:to-pink-900/20 transition-all cursor-pointer border-l-2 border-transparent hover:border-purple-500"
            >
              {/* Rank */}
              <span className="text-sm font-bold text-gray-500 w-6 text-center group-hover:text-purple-400 transition-colors">
                {index + 1}
              </span>

              {/* Album Art */}
              <div className="relative flex-shrink-0">
                <ImageWithFallback
                  src={track.image ?? undefined}
                  alt={track.title}
                  gradientSeed={track.id}
                  trackId={track.id}
                  className="h-14 w-14 rounded-lg object-cover shadow-lg ring-2 ring-gray-800 group-hover:ring-purple-500/30 transition-all"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Play className="h-6 w-6 text-white fill-white" />
                </div>
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                  {track.title}
                </p>
                <p className="text-sm text-gray-400 truncate">{track.artist}</p>
              </div>

              {/* Album */}
              <div className="hidden md:block w-32 min-w-0">
                <p className="text-sm text-gray-500 truncate">{track.album}</p>
              </div>

              {/* Plays Bar */}
              <div className="hidden sm:flex items-center gap-3 w-32">
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${(track.plays / maxPlays) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{track.plays}</span>
              </div>

              {/* Duration */}
              <span className="text-sm text-gray-500 w-12 text-right">{track.durationLabel}</span>

              {/* Menu */}
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {tracksToShow.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">No tracks available</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
