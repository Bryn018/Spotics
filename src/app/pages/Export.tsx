import { useState, useRef } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { SpoticsLogo } from "../components/SpoticsLogo";
import { Clock, Music, Headphones, TrendingUp, Loader2, Share2 } from "lucide-react";
import html2canvas from "html2canvas";
import { useExportData } from "../context/DashboardContext";

type RangeKey = "weekly" | "monthly" | "alltime";

export function Export() {
  const { data: exportData, isLoading, error } = useExportData();
  const [activeRange, setActiveRange] = useState<RangeKey>("weekly");
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

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

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: "#0f172a",
        scale: 2,
      });
      const blob = await canvas.toBlob("image/png");
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `spotics-${activeRange}-${new Date().toISOString().split("T")[0]}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setDownloadComplete(true);
        setTimeout(() => setDownloadComplete(false), 3000);
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsGenerating(false);
    }
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
    <main className="container mx-auto px-4 py-8 lg:py-12 max-w-4xl">
      {/* Tabs */}
      <div className="mb-8">
        <Tabs value={activeRange} onValueChange={(v) => setActiveRange(v as RangeKey)}>
          <TabsList className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 p-1">
            <TabsTrigger
              value="weekly"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/30 data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white transition-all px-4 py-2 text-sm font-semibold"
            >
              Weekly
            </TabsTrigger>
            <TabsTrigger
              value="monthly"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/30 data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white transition-all px-4 py-2 text-sm font-semibold"
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger
              value="alltime"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/30 data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white transition-all px-4 py-2 text-sm font-semibold"
            >
              All Time
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Preview Section - captures to image */}
      <div
        ref={exportRef}
        className="mb-8 rounded-3xl border border-gray-800/50 bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-xl p-8 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-green-500/30">
              <SpoticsLogo className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{rangeData.title}</h2>
              <p className="text-gray-400 text-sm">{rangeData.period}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-500/15 border-green-500/30 text-green-400">
            {new Date().getFullYear()}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {statsWithIcons.map((stat) => {
            const Icon = stat.Icon;
            return (
              <div key={stat.label} className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                  <Icon className="h-4 w-4" />
                  {stat.label}
                </div>
                <div className="text-3xl font-bold bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Tracks */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Music className="h-5 w-5 text-emerald-400" />
            Top Tracks
          </h3>
          <div className="space-y-2">
            {rangeData.topTracks.slice(0, 5).map((track, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/40">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm text-gray-500 w-4">#{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-white text-sm truncate">{track.title}</p>
                    <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 shrink-0">
                  {track.plays} plays
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Top Artists */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Headphones className="h-5 w-5 text-blue-400" />
            Top Artists
          </h3>
          <div className="space-y-2">
            {rangeData.topArtists.slice(0, 5).map((artist, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/40">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm text-gray-500 w-4">#{i + 1}</span>
                  <p className="font-medium text-white text-sm truncate">{artist.name}</p>
                </div>
                <Badge variant="outline" className="text-blue-400 border-blue-500/30 shrink-0">
                  {artist.plays} plays
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Genres */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            Genre Breakdown
          </h3>
          <div className="flex flex-wrap gap-2">
            {rangeData.genres.map((genre, i) => (
              <Badge
                key={genre.name}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-200 hover:from-purple-500/30 hover:to-pink-500/30"
              >
                {genre.name} {genre.value}%
              </Badge>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-gray-800/50 text-center">
          <p className="text-xs text-gray-500">Generated with Spotics • spotics.app</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleDownload}
          disabled={isGenerating}
          className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-emerald-500/40 min-w-[200px]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 4v12" />
              </svg>
              Generate Image
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleShare}
          className="border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 px-8 py-4 rounded-xl min-w-[200px]"
        >
          <Share2 className="h-5 w-5 mr-2" />
          Share
        </Button>
      </div>

      {downloadComplete && (
        <p className="text-center text-emerald-400 mt-4 text-sm">Image downloaded successfully!</p>
      )}
    </main>
  );
}
