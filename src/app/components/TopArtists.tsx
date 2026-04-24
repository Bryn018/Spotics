import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Mic2, TrendingUp } from 'lucide-react';
import type { ArtistStat } from '../types';

interface TopArtistsProps {
  artists: ArtistStat[];
}

export function TopArtists({ artists }: TopArtistsProps) {
  const displayArtists = artists.length > 0 ? artists : [];

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
            <Mic2 className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-white">Top Artists</CardTitle>
            <p className="text-sm text-gray-400">Your most played artists</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayArtists.slice(0, 5).map((artist, index) => (
          <div
            key={artist.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all"
          >
            <span className="text-sm font-bold text-gray-500 w-5 text-center">
              {index + 1}
            </span>
            <img
              src={artist.image || '/placeholder-artist.svg'}
              alt={artist.name}
              className="h-12 w-12 rounded-full object-cover shadow-md ring-2 ring-gray-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-artist.svg';
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{artist.name}</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-400" />
                <span className="text-xs text-green-400">{artist.plays} plays</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">{artist.hours}h</p>
            </div>
          </div>
        ))}
        {displayArtists.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No artists available for this timeframe</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
