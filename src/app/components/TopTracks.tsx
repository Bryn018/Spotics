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
      <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.08] p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Top Tracks</h3>
        <p className="text-gray-400">No tracks data available</p>
      </div>
    );
  }

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.08] p-6 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-white" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Top Tracks</h3>
        </div>
        <div className="space-y-3">
          {items.map((track, index) => (
            <div
              key={track.id || index}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group/track"
            >
              <div className="w-8 h-8 flex items-center justify-center text-lg font-bold text-purple-400">
                {index + 1}
              </div>
              {track.image && (
                <img
                  src={track.image}
                  alt={track.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{track.title}</h4>
                <p className="text-sm text-gray-400 truncate">{track.artist}</p>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{(() => { const n = Number(track.plays); return Number.isFinite(n) ? n.toLocaleString() : '0'; })()}</div>
                <div className="text-xs text-gray-400">plays</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
