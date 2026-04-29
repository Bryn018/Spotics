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
  const cards = [
    {
      icon: Headphones,
      label: "Tracks Played",
      value: totals.tracks.toLocaleString(),
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Music,
      label: "Artists Discovered",
      value: totals.artists.toLocaleString(),
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Radio,
      label: "Minutes Listened",
      value: `${Math.round(totals.minutes / 60)}h ${totals.minutes % 60}m`,
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
          className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.08] p-6 backdrop-blur-xl hover:border-white/[0.2] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-white" />
          <div className="relative">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg`}
            >
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{card.value}</div>
            <div className="text-sm text-gray-400">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
export const StatsOverview = OverviewCards;
