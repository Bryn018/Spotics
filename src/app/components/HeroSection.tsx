import { Sparkles } from 'lucide-react';
import { useDashboardData } from '../context/DashboardContext';
import { Button } from './ui/button';

const timeframeCopy: Record<string, string> = {
  short_term: 'the last 4 weeks',
  medium_term: 'the past 6 months',
  long_term: 'all time',
};

export function HeroSection() {
  const { data, timeframe } = useDashboardData();
  const summary = data?.summary;
  const hero = summary?.payload?.hero;
  const totals = summary?.totals;

  const totalTracks = hero?.totalTracks ?? totals?.tracks ?? 0;
  const totalArtists = hero?.totalArtists ?? totals?.artists ?? 0;
  const topArtist = hero?.topArtist ?? 'Spotify';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-1 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 animate-pulse opacity-40"></div>

      <div className="relative bg-gradient-to-br from-gray-900 via-gray-950 to-black rounded-xl p-8 lg:p-10">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              <span className="text-sm font-bold text-yellow-400 tracking-wide">{timeframeCopy[timeframe]} recap</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {totalTracks.toLocaleString()} tracks. {totalArtists.toLocaleString()} artists. <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">{topArtist}</span>{' '}
              is headlining your story.
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-xl">
              This dashboard distills your Spotify habits into living stats. Switch the timeframe or refresh to pull a brand-new summary.
            </p>
            <Button
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/20 border border-white/10"
            >
              Keep exploring
            </Button>
          </div>

          <div className="hidden lg:flex relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-2xl"></div>
            <div className="relative flex flex-col gap-4 bg-black/40 border border-white/10 rounded-2xl p-6 w-72">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Top Artist</p>
                <p className="text-2xl font-bold text-white">{topArtist}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="Minutes" value={(summary?.payload?.stats.totalMinutes ?? 0).toLocaleString()} />
                <Stat label="Avg daily" value={`${summary?.payload?.stats.averageDailyMinutes ?? 0}m`} />
                <Stat label="Tracks" value={totalTracks.toLocaleString()} />
                <Stat label="Artists" value={totalArtists.toLocaleString()} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
