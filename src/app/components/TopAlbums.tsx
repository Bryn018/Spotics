import type { AlbumStat } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function TopAlbums({ albums }: { albums?: AlbumStat[] }) {
  const albumsToShow = albums ?? [];
  const formatPlays = (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString() : '0';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {albumsToShow.length === 0 && (
        <div className="col-span-full p-8 text-center text-gray-500">
          <p>No albums yet. Start listening on Spotify!</p>
        </div>
      )}
      {albumsToShow.map((album, index) => (
        <div key={album.id} className="group cursor-pointer">
          <div className="relative mb-3">
            <div className="absolute -top-2 -left-2 bg-gradient-to-br from-green-500 to-blue-500 rounded-full w-8 h-8 flex items-center justify-center text-white text-sm font-bold z-10 shadow-lg">
              {index + 1}
            </div>
            <ImageWithFallback
              src={album.image ?? ''}
              alt={album.name}
              className="w-full aspect-square rounded-xl object-cover shadow-lg group-hover:shadow-green-500/20 transition-all duration-300 group-hover:scale-105"
            />
          </div>
          <h3 className="text-white font-medium truncate">{album.name}</h3>
          <p className="text-gray-400 text-sm truncate">{album.artist}</p>
          <p className="text-gray-500 text-xs mt-1">
            {(album as any).year ?? ''} {formatPlays((album as any).plays)} plays
          </p>
        </div>
      ))}
    </div>
  );
}
