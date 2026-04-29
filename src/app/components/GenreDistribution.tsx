interface GenreStat {
  name: string;
  percentage: number;
  hours: number;
}

interface GenreDistributionProps {
  items: GenreStat[];
}

export function GenreDistribution({ items }: GenreDistributionProps) {
  if (!items || items.length === 0) {
    return (
      <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.08] p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Genre Distribution</h3>
        <p className="text-gray-400">No genre data available</p>
      </div>
    );
  }

  const colors = [
    'from-purple-500 to-purple-600',
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
  ];

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.08] p-6 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-white" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Genre Distribution</h3>
        </div>
        <div className="space-y-3">
          {items.slice(0, 5).map((genre, index) => (
            <div key={genre.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{genre.name}</span>
                <span className="text-gray-400">{genre.hours}h ({genre.percentage}%)</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                  style={{ width: `${genre.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
