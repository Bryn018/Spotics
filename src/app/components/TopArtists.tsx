import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { ArtistStat } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function TopArtists({ artists }: { artists?: ArtistStat[] }) {
  const artistsToShow = artists ?? [];

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-white">Top Artists</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {artistsToShow.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No artists yet. Start listening on Spotify!</p>
            </div>
          )}
          {artistsToShow.map((artist, index) => (
            <div
              key={artist.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <span className="text-lg font-bold text-gray-500 w-6 text-center group-hover:text-blue-400 transition-colors">
                {index + 1}
              </span>
              <ImageWithFallback
                src={artist.image ?? ''}
                alt={artist.name}
                gradientSeed={artist.id}
                artistId={artist.id}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-800 group-hover:ring-blue-500/50 transition-all"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{artist.name}</p>
                <p className="text-gray-400 text-sm">{artist.plays} plays</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-gray-400 text-sm">{artist.hours}h</p>
                <p className="text-gray-500 text-xs">{artist.genres?.slice(0, 2).join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
