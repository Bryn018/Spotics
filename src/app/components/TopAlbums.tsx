import { Card, CardContent } from './ui/card';
import type { AlbumStat } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function TopAlbums({ albums }: { albums?: AlbumStat[] }) {
  const albumsToShow = albums ?? [];
  const formatPlays = (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString() : '0';
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {albumsToShow.slice(0, 5).map((album, index) => (
            <div
              key={album.id}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-4 hover:from-purple-900/20 hover:to-pink-900/20 transition-all hover:scale-[1.02] border border-gray-700/30 hover:border-purple-500/30"
            >
              <div className="relative mb-3">
                <ImageWithFallback
                  src={album.image ?? undefined}
                  alt={album.name}
                  gradientSeed={album.id}
                  className="w-full aspect-square rounded-lg object-cover shadow-xl ring-2 ring-gray-800 group-hover:ring-purple-500/30 transition-all"
                />
                <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                  #{index + 1}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                  {album.name}
                </h3>
                <p className="text-sm text-gray-400 truncate">{album.artist}</p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                  <span className="text-xs text-gray-500">{album.totalMinutes} min</span>
                  <span className="text-xs text-purple-400 font-semibold">{formatPlays(album.plays)} plays</span>
                </div>
              </div>
            </div>
          ))}
          {albumsToShow.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">No albums available</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
