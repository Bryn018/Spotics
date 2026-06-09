import type { AlbumStat } from '../types';
import { Disc3 } from 'lucide-react';

interface TopAlbumsProps {
  items: AlbumStat[];
}

export function TopAlbums({ items }: TopAlbumsProps) {
  if (items.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-6">
        <p className="text-gray-500 font-mono">No albums found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-md bg-rose-500/10 flex items-center justify-center">
          <Disc3 className="h-4 w-4 text-rose-400" />
        </div>
        <h2 className="text-lg font-bold text-white font-mono">Top Albums</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.slice(0, 10).map((album, i) => (
          <div key={album.id} className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-3 hover:bg-gray-800/30 transition-colors">
            <div className="aspect-square bg-gray-800 rounded-md mb-3 flex items-center justify-center">
              <Disc3 className="h-10 w-10 text-gray-700" />
            </div>
            <p className="text-white text-sm font-medium truncate">{album.name}</p>
            <p className="text-gray-500 text-xs truncate">{album.artist}</p>
            <p className="text-rose-400 font-mono text-xs mt-1">{album.plays} plays</p>
          </div>
        ))}
      </div>
    </div>
  );
}
