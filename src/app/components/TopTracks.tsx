import { Play, TrendingUp, TrendingDown } from "lucide-react";

interface TrackStat {
  id: string;
  title: string;
  artist: string;
  album: string;
  plays: number;
  durationMs: number;
  durationLabel: string;
  image: string | null;
}

interface TopTracksProps {
  items: TrackStat[];
  trend: number[];
}

export function TopTracks({ items, trend }: TopTracksProps) {
  if (!items || items.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Top Tracks</h3>
        <p className="text-gray-400">No track data available</p>
      </div>
    );
  }

  // Calculate max plays for progress bar scaling
  const maxPlays = Math.max(...items.map(t => t.plays));

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/30 shadow-xl p-6 backdrop-blur-xl hover:border-purple-500/30 transition-all">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Top Tracks</h3>
        </div>
        <div className="space-y-3">
          {items.slice(0, 10).map((track, index) => {
            const plays = Number.isFinite(Number(track.plays)) ? track.plays : 0;
            const progress = maxPlays > 0 ? (plays / maxPlays) * 100 : 0;
            
            return (
              <div
                key={track.id || index}
                className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 transition-all group/track"
              >
                {/* Rank Badge with gradient */}
                <div className="w-8 h-8 flex items-center justify-center text-sm font-bold text-white rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shrink-0">
                  {index + 1}
                </div>

                {/* Album Art */}
                {track.image && (
                  <img
                    src={track.image}
                    alt={track.title}
                    className="w-10 h-10 rounded object-cover shadow-md group-hover:ring-2 group-hover:ring-purple-500/30 transition-all"
                  />
                )}

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate text-sm">{track.title}</h4>
                  <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                </div>

                {/* Plays */}
                <div className="text-right shrink-0">
                  <div className="text-white font-semibold text-sm">{plays.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">plays</div>
                </div>

                {/* Duration */}
                <div className="text-right shrink-0">
                  <div className="text-gray-400 text-sm">{track.durationLabel}</div>
                </div>

                {/* Progress bar (visual indicator) */}
                <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
