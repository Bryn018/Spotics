interface AlbumStat {
  id: string;
  name: string;
  artist: string;
  plays: number;
  totalMinutes: number;
  image: string | null;
}

interface TopAlbumsProps {
  items: AlbumStat[];
}

export function TopAlbums({ items }: TopAlbumsProps) {
  if (!items || items.length === 0) {
    return (
      <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.08] p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Top Albums</h3>
        <p className="text-gray-400">No albums data available</p>
      </div>
    );
  }

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.08] p-6 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-white" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Top Albums</h3>
        </div>
        <div className="space-y-3">
          {items.map((album, index) => (
            <div
              key={album.id || index}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group/album"
            >
              <div className="w-8 h-8 flex items-center justify-center text-sm font-bold text-green-400">
                #{index + 1}
              </div>
              {album.image && (
                <img
                  src={album.image}
                  alt={album.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{album.name}</h4>
                <p className="text-sm text-gray-400 truncate">{album.artist}</p>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{album.plays.toLocaleString()}</div>
                <div className="text-xs text-gray-400">plays</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
