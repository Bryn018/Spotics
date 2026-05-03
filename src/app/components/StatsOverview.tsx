import { Headphones, Music, Radio, BarChart3 } from "lucide-react";

interface OverviewCardsProps {
  totals: {
    minutes: number;
    tracks: number;
    artists: number;
  };
  stats: {
    totalMinutes: number;
    totalTracks: number;
    totalArtists: number;
    averageDailyMinutes: number;
    songsThisWeek?: number;
  } | null;
  genreCount?: number;
}

export function OverviewCards({ totals, stats, genreCount = 0 }: OverviewCardsProps) {
  const safeTotals = {
    tracks: Number.isFinite(Number(totals?.tracks)) ? totals.tracks : 0,
    artists: Number.isFinite(Number(totals?.artists)) ? totals.artists : 0,
    minutes: Number.isFinite(Number(totals?.minutes)) ? totals.minutes : 0,
  };
  const cards = [
    {
      icon: Headphones,
      label: "Tracks Played",
      value: safeTotals.tracks.toLocaleString(),
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Music,
      label: "Artists Discovered",
      value: safeTotals.artists.toLocaleString(),
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Radio,
      label: "Minutes Listened",
      value: `${Math.round(safeTotals.minutes / 60)}h ${safeTotals.minutes % 60}m`,
      color: "from-green-500 to-green-600",
    },
    {
      icon: BarChart3,
      label: "Genres Explored",
      value: genreCount.toString(),
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/30 to-gray-800/20 border border-gray-800/30 shadow-xl p-6 backdrop-blur-xl hover:border-emerald-500/30 hover:from-emerald-900/20 hover:to-emerald-800/20 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-white" />
          <div className="relative">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg ring-1 ring-white/10`}
            >
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-1">{card.value}</div>
            <div className="text-sm text-gray-400">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
export const StatsOverview = OverviewCards;
