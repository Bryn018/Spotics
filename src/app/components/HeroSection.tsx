import { Play, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { useDashboardData } from '../context/DashboardContext';

const timeframeCopy: Record<string, string> = {
  short_term: 'your last 4 weeks',
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
  const headlineArtist = hero?.topArtist ?? 'Spotify';
  const timeframeLabel = timeframeCopy[timeframe] ?? 'your listening';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-1 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 animate-pulse opacity-50" />

      <div className="relative bg-gradient-to-br from-gray-900 via-gray-950 to-black rounded-xl p-8 lg:p-10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1771789391889-e209bf941a1c?w=1200')] bg-cover bg-center opacity-10 rounded-xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full" />
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              <span className="text-sm font-bold text-yellow-400 tracking-wide uppercase">
                {timeframeLabel} recap
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {totalTracks.toLocaleString()} tracks · {totalArtists.toLocaleString()} artists
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                {headlineArtist}
              </span>{' '}
              is headlining your story.
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-xl">
              Spotics turns your Spotify habits into a cinematic story. Switch timeframes or refresh data to see the
              soundtrack of your life evolve in real time.
            </p>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-6 text-base shadow-xl hover:shadow-purple-500/30 transition-all hover:scale-105">
              <Play className="h-5 w-5 mr-2" fill="white" />
              View listening insights
            </Button>
          </div>

          <div className="hidden lg:block relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1672841821756-fc04525771c2?w=600&auto=format&fit=crop"
              alt="Music collage"
              className="relative h-64 w-64 rounded-2xl object-cover shadow-2xl ring-4 ring-purple-500/30 hover:ring-pink-500/30 transition-all hover:scale-105"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
