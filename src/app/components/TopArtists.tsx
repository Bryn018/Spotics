import { TrendingUp } from "lucide-react";

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
      <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.08] p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Top Artists</h3>
        <p className="text-gray-400">No artists data available</p>
      </div>
    );
  }

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.08] p-6 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-white" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Top Artists</h3>
        </div>
        <div className="space-y-3">
          {items.map((artist, index) => (
            <div
              key={artist.id || index}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group/artist"
            >
              <div className="w-8 h-8 flex items-center justify-center text-lg font-bold text-blue-400">
                {index + 1}
              </div>
              {artist.image && (
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{artist.name}</h4>
                <p className="text-sm text-gray-400 truncate">
                  {artist.genres?.slice(0, 2).join(", ") || ""}
                </p>
              </div>
              <div className="text-right text-sm text-gray-500">
                {artist.plays.toLocaleString()} plays
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
