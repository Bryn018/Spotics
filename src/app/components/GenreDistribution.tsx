import type { GenreStat } from '../types';

const colors = ['#1DB954', '#3b82f6', '#f43f5e', '#a855f7', '#06b6d4', '#f59e0b', '#ec4899', '#14b8a6', '#8b5cf6', '#ef4444'];

export function GenreDistribution({ genres }: { genres?: GenreStat[] }) {
  const genresToShow = genres?.length ? genres.map((g, i) => ({
    ...g,
    color: colors[i % colors.length]
  })) : [];

  const totalPlays = genresToShow.reduce((sum, g) => sum + (g.hours * 60), 0);

  return (
    <div className="rounded-2xl bg-[#121212] border border-white/[0.06] p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Genre Distribution</h3>
        <p className="text-gray-500 text-sm mt-0.5">Your most listened genres</p>
      </div>

      {genresToShow.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>No genre data yet. Start listening on Spotify!</p>
        </div>
      )}

      {genresToShow.length > 0 && (
        <>
          {/* Top Genre Highlight */}
          <div className="mb-6 p-4 rounded-xl bg-[#1a1a1a] border border-white/[0.06]">
            <p className="text-gray-500 text-xs mb-1">Top Genre</p>
            <p className="text-2xl font-bold text-white">{genresToShow[0]?.name ?? 'Pop'}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-2 flex-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${genresToShow[0]?.percentage ?? 32}%`,
                    backgroundColor: genresToShow[0]?.color ?? '#1DB954'
                  }}
                />
              </div>
              <span className="text-green-400 font-semibold text-sm">{genresToShow[0]?.percentage ?? 32}%</span>
            </div>
          </div>

          {/* Genre Breakdown */}
          <div className="space-y-3">
            {genresToShow.map((genre, index) => (
              <div key={`${genre.name}-${index}`} className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: genre.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">{genre.name}</span>
                    <span className="text-gray-500 text-xs">{genre.hours}h • {genre.percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${genre.percentage}%`,
                        backgroundColor: genre.color
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
            <p className="text-gray-500 text-xs">Total Plays</p>
            <p className="text-white font-semibold">{totalPlays.toLocaleString()}</p>
          </div>
        </>
      )}
    </div>
  );
}
