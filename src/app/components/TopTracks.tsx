import { MoreVertical, Play } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useDashboardData } from '../context/DashboardContext';

export function TopTracks() {
  const { data } = useDashboardData();
  const tracks = data?.summary?.payload?.topTracks ?? [];
  const maxPlays = tracks[0]?.plays ?? 1;

  if (!tracks.length) {
    return <EmptyState message="No tracks for this timeframe yet." />;
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
      <CardContent className="p-6">
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <div
              key={track.id ?? index}
              className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-900/20 hover:to-pink-900/20 transition-all border border-transparent hover:border-purple-500/20"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400 font-bold text-sm">
                  {index + 1}
                </div>

                <div className="relative">
                  {track.image ? (
                    <img
                      src={track.image}
                      alt={track.title}
                      className="h-14 w-14 rounded-lg object-cover shadow-lg ring-2 ring-gray-800 group-hover:ring-purple-500/30 transition-all"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-gray-800 ring-2 ring-gray-800 flex items-center justify-center text-gray-500">
                      ♫
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                      <Play className="h-4 w-4 text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate mb-1">{track.title}</p>
                  <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-6">
                <span className="text-sm text-gray-400 w-32 truncate">{track.album}</span>
                <div className="flex items-center gap-2 w-24">
                  <div className="h-2 flex-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${Math.min(100, (track.plays / maxPlays) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-purple-400 font-medium">{track.plays}</span>
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">{track.durationLabel}</span>
              </div>

              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </Button>
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
