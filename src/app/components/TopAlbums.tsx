import { Play, Heart } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useDashboardData } from '../context/DashboardContext';

export function TopAlbums() {
  const { data } = useDashboardData();
  const albums = data?.summary?.payload?.topAlbums ?? [];

  if (albums.length === 0) {
    return <EmptyState message="Albums for this timeframe will appear after a sync." />;
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {albums.map((album, index) => (
            <div
              key={album.id}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-4 hover:from-purple-900/20 hover:to-pink-900/20 transition-all hover:scale-[1.02] border border-gray-700/30 hover:border-purple-500/30"
            >
              <div className="relative mb-3">
                {album.image ? (
                  <img
                    src={album.image}
                    alt={album.name}
                    className="w-full aspect-square rounded-lg object-cover shadow-xl ring-2 ring-gray-800 group-hover:ring-purple-500/30 transition-all"
                  />
                ) : (
                  <div className="w-full aspect-square rounded-lg bg-gray-800 flex items-center justify-center text-gray-500 text-xl ring-2 ring-gray-800">
                    ♫
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <Button size="icon" className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    <Play className="h-5 w-5 text-white ml-0.5" fill="white" />
                  </Button>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-8 w-8 bg-black/60 hover:bg-black/80">
                    <Heart className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                  #{index + 1}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white truncate">{album.name}</h3>
                <p className="text-sm text-gray-400 truncate">{album.artist}</p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                  <span className="text-xs text-gray-500">{album.totalMinutes} mins</span>
                  <span className="text-xs text-purple-400 font-semibold">{album.plays} plays</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 border-dashed border-gray-800 text-center py-12">
      <p className="text-gray-400">{message}</p>
    </Card>
  );
}
