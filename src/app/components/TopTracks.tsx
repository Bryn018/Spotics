import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Play, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import type { TrackStat } from '../types';

interface TopTracksProps {
  tracks: TrackStat[];
}

export function TopTracks({ tracks }: TopTracksProps) {
  const displayTracks = tracks.length > 0 ? tracks : [];

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-white">Top Tracks</CardTitle>
          <p className="text-sm text-gray-400 mt-1">Your most played songs</p>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayTracks.slice(0, 5).map((track, index) => (
          <div
            key={track.id}
            className="group flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all cursor-pointer"
          >
            <span className="text-sm font-bold text-gray-500 w-5 text-center">
              {index + 1}
            </span>
            <div className="relative">
              <img
                src={track.image || '/placeholder-album.svg'}
                alt={track.title}
                className="h-12 w-12 rounded-lg object-cover shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-album.svg';
                }}
              />
              <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="h-5 w-5 text-white fill-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{track.title}</p>
              <p className="text-xs text-gray-400 truncate">{track.artist}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">{track.plays} plays</p>
              <p className="text-xs text-gray-600">{track.durationLabel ?? '0:00'}</p>
            </div>
          </div>
        ))}
        {displayTracks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No tracks available for this timeframe</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
