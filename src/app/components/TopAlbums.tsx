interface AlbumStat {
  id: string;
  name: string;
  artist: string;
  plays: number;
  year?: string;
  image: string | null;
}

interface TopAlbumsProps {
  items: AlbumStat[];
}

export function TopAlbums({ items }: TopAlbumsProps) {
  if (!items || items.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Top Albums</h3>
        <p className="text-gray-400">No album data available</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Top Albums</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {items.slice(0, 5).map((album, index) => (
          <div
            key={album.id || index}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/30 p-4 hover:from-purple-900/20 hover:to-pink-900/20 hover:border-purple-500/30 transition-all hover:scale-[1.02]"
          >
            {/* Album Cover */}
            <div className="relative mb-3">
              {album.image ? (
                <img
                  src={album.image}
                  alt={album.name}
                  className="w-full aspect-square rounded-lg object-cover shadow-xl ring-2 ring-gray-800 group-hover:ring-purple-500/30 transition-all"
                />
              ) : (
                <div className="w-full aspect-square rounded-lg bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 text-2xl">🎵</span>
                </div>
              )}
              {/* Rank Badge */}
              <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                #{index + 1}
              </div>
            </div>

            {/* Album Info */}
            <div className="space-y-1">
              <h4 className="font-bold text-white truncate">{album.name}</h4>
              <p className="text-sm text-gray-400 truncate">{album.artist}</p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                <span className="text-xs text-gray-500">{album.year || '2020'}</span>
                <span className="text-xs text-purple-400 font-semibold">
                  {Number(album.plays ?? 0).toLocaleString()} plays
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
