import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useDashboardData } from '../context/DashboardContext';

export function GenreDistribution() {
  const { data } = useDashboardData();
  const genres = data?.summary?.payload?.genreDistribution ?? [];

  if (genres.length === 0) {
    return <EmptyState message="We need more listening history to build your genre DNA." />;
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20" />
          <CardTitle className="text-xl text-white">Genre Distribution</CardTitle>
        </div>
        <p className="text-sm text-gray-400 mt-2">Share of time spent per genre</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {genres.map((genre) => (
            <div key={genre.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">{genre.name}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">{genre.hours}h</span>
                  <span className="text-white font-semibold">{genre.percentage}%</span>
                </div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${Math.min(100, genre.percentage)}%` }}
                />
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
      <CardContent>
        <p className="text-gray-400">{message}</p>
      </CardContent>
    </Card>
  );
}
