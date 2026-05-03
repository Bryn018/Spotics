import { TrendingUp } from "lucide-react";
import { Badge } from "./ui/badge";

interface ArtistStat {
  id: string;
  name: string;
  plays: number;
  hours: number;
  image: string | null;
  genres: string[];
}

interface TopArtistsProps {
  items: ArtistStat[];
}

export function TopArtists({ items }: TopArtistsProps) {
  if (!items || items.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Top Artists</h3>
        <p className="text-gray-400">No artist data available</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Top Artists</h3>
      <div className="space-y-3">
        {items.slice(0, 6).map((artist, index) => {
          const plays = Number.isFinite(Number(artist.plays)) ? artist.plays : 0;
          const hours = Number.isFinite(Number(artist.hours)) ? artist.hours : 0;
          
          return (
            <div
              key={artist.id || index}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/30 p-4 hover:from-purple-900/20 hover:to-pink-900/20 hover:border-purple-500/30 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative flex items-center gap-4">
                {/* Rank Badge - top right positioned absolutely on avatar */}
                <div className="relative flex-shrink-0">
                  {artist.image ? (
                    <div className="relative">
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="h-14 w-14 rounded-full object-cover ring-2 ring-purple-500/30 group-hover:ring-purple-500/50 transition-all shadow-lg"
                      />
                      {/* Floating badge indicator */}
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-gray-900 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{index + 1}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                      <span className="text-xl font-bold text-purple-300">{index + 1}</span>
                    </div>
                  )}
                </div>

                {/* Artist Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate">{artist.name}</h4>
                  <p className="text-sm text-purple-400 font-medium">{plays.toLocaleString()} plays</p>
                </div>

                {/* Listening Time */}
                <div className="hidden sm:block text-right">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Listening time</div>
                  <div className="text-sm font-semibold text-white">{hours}h</div>
                </div>

                {/* Genre Badges */}
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {artist.genres?.slice(0, 2).map((genre, i) => (
                    <Badge
                      key={i}
                      className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
