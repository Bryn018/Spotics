import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Clock, Music, Headphones, TrendingUp, Loader2, FileJson, Share2 } from "lucide-react";
import { useExportData } from "../context/DashboardContext";

type RangeKey = "weekly" | "monthly" | "alltime";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  Music,
  Headphones,
  TrendingUp,
};

export function Export() {
  const { data: exportData, isLoading, error } = useExportData();
  const [activeRange, setActiveRange] = useState<RangeKey>("weekly");
  const [isDownloading, setIsDownloading] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (error || !exportData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">Error loading export data</p>
      </div>
    );
  }

  const rangeData = exportData[activeRange];

  // Map stats to include icon component
  const statsWithIcons = rangeData.stats.map((stat) => ({
    ...stat,
    Icon: iconMap[stat.icon] || TrendingUp,
  }));

  const handleDownloadJSON = async () => {
    setIsDownloading(true);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spotics-export-${activeRange}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsDownloading(false);
  };

  const handleShare = async () => {
    const text = `My ${activeRange} listening summary on Spotics: ${rangeData.title} (${rangeData.period}). ${rangeData.topTracks.length} top tracks, ${rangeData.genres.length} genres explored!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Spotics Summary", text });
      } catch {
        // ignore
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Summary copied to clipboard!");
    }
  };

  return (
    <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1400px]">
      {/* Hero */}
      <div className="mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500/10 via-teal-500/10 to-blue-500/10 border border-green-500/20 p-8 lg:p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-green-500/30">
            <svg className="h-6 w-6 text-green-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
              Export Your Insights
            </h1>
            <p className="text-gray-300 text-lg mt-2">
              Download your listening history and share your music journey.
            </p>
          </div>
        </div>
      </div>

      {/* Range selector */}
      <div className="mb-8">
        <Tabs value={activeRange} onValueChange={(v) => setActiveRange(v as RangeKey)}>
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="weekly" className="data-[state=active]:bg-green-600">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="data-[state=active]:bg-green-600">Monthly</TabsTrigger>
            <TabsTrigger value="alltime" className="data-[state=active]:bg-green-600">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Card */}
      <Card className="mb-8 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.08]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white">{rangeData.title} Summary</CardTitle>
              <p className="text-gray-400 mt-1">{rangeData.period}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleDownloadJSON} disabled={isDownloading}>
                <FileJson className="h-4 w-4 mr-2" />
                {isDownloading ? "Generating..." : "Download JSON"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {statsWithIcons.map((stat) => {
              const Icon = stat.Icon;
              return (
                <div key={stat.label} className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Icon className="h-4 w-4" />
                    <span>{stat.label}</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                </div>
              );
            })}
          </div>

          {/* Sections: Top Tracks, Top Artists, Genres */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Tracks */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Music className="h-5 w-5 text-purple-400" />
                Top Tracks
              </h3>
              <div className="space-y-3">
                {rangeData.topTracks.map((track, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{track.title}</p>
                      <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">{track.plays} plays</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Artists */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Headphones className="h-5 w-5 text-blue-400" />
                Top Artists
              </h3>
              <div className="space-y-3">
                {rangeData.topArtists.map((artist, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{artist.name}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">{artist.plays} plays</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Genres
              </h3>
              <div className="space-y-3">
                {rangeData.genres.map((genre) => (
                  <div key={genre.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: genre.color }}></span>
                        {genre.name}
                      </span>
                      <span className="text-gray-400">{genre.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${genre.value}%`, backgroundColor: genre.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
