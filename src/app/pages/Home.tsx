import { StatsOverview } from "../components/StatsOverview";
import { TopTracks } from "../components/TopTracks";
import { TopArtists } from "../components/TopArtists";
import { TopAlbums } from "../components/TopAlbums";
import { ListeningChart } from "../components/ListeningChart";
import { GenreDistribution } from "../components/GenreDistribution";
import { RecentActivity } from "../components/RecentActivity";
import { useDashboardData } from "../context/DashboardContext";
import { Loader2 } from "lucide-react";

export function Home() {
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-white/50" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-400">Error loading data: {error.message}</p>
        </div>
      </main>
    );
  }

  if (!data || !data.summary) {
    return (
      <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-400">No data available</p>
        </div>
      </main>
    );
  }

  const { summary, activities } = data;
  const payload = summary.payload;

  // Compute genre count from payload if available
  const genreCount = payload?.genreDistribution?.length || 0;

  return (
    <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
      <div className="space-y-8">
        <StatsOverview
          totals={summary.totals}
          stats={payload?.stats || null}
          genreCount={genreCount}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TopTracks
            items={payload?.topTracks || []}
            trend={summary.trends?.tracks || []}
          />
          <TopArtists
            items={payload?.topArtists || []}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TopAlbums
            items={payload?.topAlbums || []}
          />
          <ListeningChart
            data={payload?.listeningChart || []}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GenreDistribution
            items={payload?.genreDistribution || []}
          />
          <RecentActivity
            activities={activities || []}
          />
        </div>
      </div>
    </main>
  );
}
