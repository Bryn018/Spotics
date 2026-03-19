import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { useDashboardData } from '../context/DashboardContext';

export function TopArtists() {
  const { data } = useDashboardData();
  const artists = data?.summary?.payload?.topArtists ?? [];

  if (!artists.length) {
    return <EmptyState message="No standout artists yet. Refresh to pull the latest listening data." />;
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {artists.map((artist, index) => (
            <div
              key={artist.id ?? index}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-5 hover:from-purple-900/20 hover:to-pink-900/20 transition-all hover:scale-[1.02] border border-gray-700/30 hover:border-purple-500/30"
            >
              <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-xs font-bold text-purple-300 border border-purple-500/30">
                {index + 1}
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  {artist.image ? (
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-purple-500/30 group-hover:ring-purple-500/50 transition-all shadow-lg"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-800 ring-2 ring-purple-500/20 flex items-center justify-center text-lg text-gray-400">
                      {artist.name?.[0] ?? '?'}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-gray-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate mb-1">{artist.name}</h3>
                  <p className="text-sm text-purple-400 font-medium">{artist.plays} plays</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-800/40">
                  <span className="text-xs text-gray-400">Listening time</span>
                  <span className="text-sm text-white font-semibold">{artist.hours}h</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(artist.genres ?? []).slice(0, 3).map((genre) => (
                    <Badge
                      key={`${artist.id}-${genre}`}
                      variant="secondary"
                      className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30"
                    >
                      {genre}
                    </Badge>
                  ))}
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
