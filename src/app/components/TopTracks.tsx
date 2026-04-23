import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Play, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import type { TrackStat } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function TopTracks({ tracks }: { tracks?: TrackStat[] }) {
  const tracksToShow = tracks ?? [];

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-white">Top Tracks</CardTitle>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tracksToShow.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No tracks yet. Start listening on Spotify!</p>
            </div>
          )}
          {tracksToShow.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <span className="text-lg font-bold text-gray-500 w-6 text-center group-hover:text-green-400 transition-colors">
                {index + 1}
              </span>
              <ImageWithFallback
                src={track.image ?? ''}
                alt={track.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{track.title}</p>
                <p className="text-gray-400 text-sm truncate">{track.artist}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-gray-400 text-sm">{track.plays} plays</p>
                <p className="text-gray-500 text-xs">{track.durationLabel ?? ''}</p>
              </div>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-4 w-4 text-green-400" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
