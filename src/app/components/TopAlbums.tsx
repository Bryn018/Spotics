import type { AlbumStat } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function TopAlbums({ albums }: { albums?: AlbumStat[] }) {
  const albumsToShow = albums ?? [];
  const formatPlays = (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString() : '0';
  };

  return (
    <div className="rounded-2xl bg-[#121212] border border-white/[0.06] overflow-hidden">
      <div className="p-6 pb-4">
        <h2 className="text-xl font-bold text-white">Top Albums</h2>
      </div>
      <div className="px-4 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {albumsToShow.slice(0, 5).map((album, index) => (
            <div
              key={album.id}
              className="group cursor-pointer"
            >
              <div className="relative mb-3 aspect-square">
                <ImageWithFallback
                  src={album.image ?? undefined}
                  alt={album.name}
                  gradientSeed={album.id}
                  className="w-full h-full rounded-xl object-cover shadow-xl ring-1 ring-white/[0.06] group-hover:ring-white/20 transition-all"
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md">
                  #{index + 1}
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold text-white truncate group-hover:text-green-400 transition-colors text-sm">
                  {album.name}
                </h3>
                <p className="text-xs text-gray-400 truncate">{album.artist}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-gray-500">{album.totalMinutes} min</span>
                  <span className="text-[11px] text-green-400 font-medium">{formatPlays(album.plays)} plays</span>
                </div>
              </div>
            </div>
          ))}
          {albumsToShow.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">No albums available</div>
          )}
        </div>
      </div>
    </div>
  );
}
