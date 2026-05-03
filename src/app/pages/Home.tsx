import { StatsOverview } from "../components/StatsOverview";
import { TopTracks } from "../components/TopTracks";
import { TopArtists } from "../components/TopArtists";
import { TopAlbums } from "../components/TopAlbums";
import { ListeningChart } from "../components/ListeningChart";
import { GenreDistribution } from "../components/GenreDistribution";
import { RecentActivity } from "../components/RecentActivity";
import { WrappedSelector } from "../components/WrappedSelector";
import { TimeRangeSelector } from "../components/TimeRangeSelector";
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
        {/* Hero Section - WrappedSelector */}
        <WrappedSelector />

        {/* Time Range Selector */}
        <TimeRangeSelector />

        {/* Stats Overview */}
        <StatsOverview
          totals={summary.totals}
          stats={payload?.stats || null}
          genreCount={genreCount}
        />

        {/* Top Albums (5-column grid) */}
        <section className="mb-12">
          <TopAlbums items={payload?.topAlbums || []} />
        </section>

        {/* Main grid: Top Tracks (7 cols) + Top Artists (5 cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 mb-12">
          <div className="xl:col-span-7">
            <TopTracks
              items={payload?.topTracks || []}
              trend={summary.trends?.tracks || []}
            />
          </div>
          <div className="xl:col-span-5">
            <TopArtists
              items={payload?.topArtists || []}
            />
          </div>
        </div>

        {/* Charts grid: Listening Chart + Genre Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ListeningChart
            data={payload?.listeningChart || []}
          />
          <GenreDistribution
            items={payload?.genreDistribution || []}
          />
        </div>

        {/* Recent Activity */}
        <section className="mb-12">
          <RecentActivity
            activities={activities || []}
          />
        </section>
      </div>
    </main>
  );
}
