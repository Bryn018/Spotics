import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import type { ArtistStat } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function TopArtists({ artists }: { artists?: ArtistStat[] }) {
  const artistsToShow = artists ?? [];

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white">Top Artists</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {artistsToShow.slice(0, 6).map((artist, index) => (
            <div
              key={artist.id}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-4 hover:from-purple-900/20 hover:to-pink-900/20 transition-all hover:scale-[1.02] border border-gray-700/30 hover:border-purple-500/30"
            >
              <div className="flex items-center gap-4">
                {/* Artist Image */}
                <div className="relative flex-shrink-0">
                  <ImageWithFallback
                    src={artist.image ?? undefined}
                    alt={artist.name}
                    gradientSeed={artist.id}
                    artistId={artist.id}
                    className="h-16 w-16 rounded-full object-cover shadow-lg ring-2 ring-gray-800 group-hover:ring-purple-500/30 transition-all"
                  />
                  {/* Rank Badge */}
                  <div className="absolute -top-1 -left-1 h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                    {index + 1}
                  </div>
                </div>

                {/* Artist Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                    {artist.name}
                  </h3>
                  <p className="text-sm text-gray-400">{artist.hours}h listened</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {artist.genres?.slice(0, 2).map((genre) => (
                      <Badge
                        key={genre}
                        variant="secondary"
                        className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between">
                <span className="text-xs text-gray-500">{artist.plays} plays</span>
                <div className="h-1 w-16 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${Math.min((artist.plays / 1000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          {artistsToShow.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">No artists available</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
