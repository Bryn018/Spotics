import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Disc3 } from 'lucide-react';
import type { AlbumStat } from '../types';

interface TopAlbumsProps {
  albums: AlbumStat[];
}

export function TopAlbums({ albums }: TopAlbumsProps) {
  const displayAlbums = albums.length > 0 ? albums : [];

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Disc3 className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-white">Top Albums</CardTitle>
            <p className="text-sm text-gray-400">Your most played albums</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayAlbums.slice(0, 5).map((album, index) => (
          <div
            key={album.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all"
          >
            <span className="text-sm font-bold text-gray-500 w-5 text-center">
              {index + 1}
            </span>
            <img
              src={album.image || '/placeholder-album.svg'}
              alt={album.name}
              className="h-12 w-12 rounded-lg object-cover shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-album.svg';
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{album.name}</p>
              <p className="text-xs text-gray-400 truncate">{album.artist}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">{album.plays} plays</p>
              <p className="text-xs text-gray-600">{album.totalMinutes}m</p>
            </div>
          </div>
        ))}
        {displayAlbums.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No albums available for this timeframe</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
