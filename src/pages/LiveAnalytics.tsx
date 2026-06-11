import { useState, useEffect, type ReactNode } from 'react';
import { useScrobbleStats, useTopArtists, useTopTracks, useListeningStats, useHeatmap, useNowPlaying, useRecentScrobbles } from '../hooks/useScrobbleData';
import { ScrobblerConnect } from '../components/ScrobblerConnect';
import { NavBar } from '../components/NavBar';
import { Loader2, Music, Clock, Users, Disc3, TrendingUp, Calendar, Activity, Wifi, WifiOff } from 'lucide-react';
import { validateKey } from '../services/scrobbleApi';

type Period = '7d' | '30d' | '90d' | '1y' | 'all';

const PERIODS: { value: Period; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
];

export function LiveAnalytics() {
  const [period, setPeriod] = useState<Period>('30d');
  const { data: stats, loading: statsLoading, lastUpdated: statsUpdated } = useScrobbleStats(period);
  const { data: topArtists, loading: artistsLoading } = useTopArtists(period, 10);
  const { data: topTracks, loading: tracksLoading } = useTopTracks(period, 10);
  const { data: listeningStats, loading: listeningLoading } = useListeningStats(period);
  const { data: heatmapData, loading: heatmapLoading } = useHeatmap(period);
  const { data: nowPlayingData } = useNowPlaying(3000);
  const { data: recentScrobbles, loading: recentLoading } = useRecentScrobbles(20);

  const [isConnected, setIsConnected] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);
  const [liveIndicator, setLiveIndicator] = useState(false);

  // Validate stored key on mount — reject revoked keys
  useEffect(() => {
    const key = localStorage.getItem('spotics_api_key');
    if (key) {
      validateKey(key).then((valid) => {
        if (valid) {
          setIsConnected(true);
        } else {
          localStorage.removeItem('spotics_api_key');
        }
        setCheckingKey(false);
      });
    } else {
      setCheckingKey(false);
    }
  }, []);

  // Poll for API key in case the extension bridge syncs it after mount
  useEffect(() => {
    if (isConnected) return;
    const interval = setInterval(async () => {
      const key = localStorage.getItem('spotics_api_key');
      if (key) {
        const valid = await validateKey(key);
        if (valid) {
          setIsConnected(true);
          clearInterval(interval);
        } else {
          localStorage.removeItem('spotics_api_key');
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  // Live indicator pulse — flashes when data updates
  useEffect(() => {
    if (statsUpdated) {
      setLiveIndicator(true);
      const timeout = setTimeout(() => setLiveIndicator(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [statsUpdated]);

  if (checkingKey) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <p className="text-gray-400 font-mono">Verifying connection...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black">
        <NavBar currentPage="live" />
        <main className="container mx-auto px-4 lg:px-6 py-10 max-w-[1200px]">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold font-mono text-green-400 mb-2">Live Analytics</h1>
            <p className="text-gray-400 font-mono">Connect the Spotics Scrobbler to track your listening in real time</p>
          </div>
          <ScrobblerConnect />
        </main>
      </div>
    );
  }

  const isLoading = statsLoading && !stats;

  return (
    <div className="min-h-screen bg-black">
      <NavBar currentPage="live" />
      <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold font-mono text-green-400">Live Analytics</h1>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono transition-all duration-300 ${
                liveIndicator
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-gray-800 text-gray-500 border border-gray-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  liveIndicator ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
                }`}></span>
                {liveIndicator ? 'LIVE' : 'IDLE'}
              </div>
            </div>
            <p className="text-gray-500 font-mono text-sm">
              Real-time listening insights — refreshes every 8s
              {statsUpdated && (
                <span className="text-gray-600 ml-2">
                  · Last update: {statsUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-1 bg-gray-900 rounded-lg p-1 border border-gray-800">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-md font-mono text-xs transition-colors ${
                  period === p.value
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Now Playing */}
        {nowPlayingData?.now_playing && (
          <div className="mb-8 p-4 rounded-lg border border-green-500/20 bg-green-500/5">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-green-400 animate-pulse" />
              <div className="flex-1 min-w-0">
                <p className="text-green-400 font-mono text-xs mb-1">NOW PLAYING</p>
                <p className="text-gray-100 font-mono text-sm font-semibold truncate">
                  {nowPlayingData.track?.title}
                </p>
                <p className="text-gray-400 font-mono text-xs truncate">
                  {nowPlayingData.track?.artist}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-green-500" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Music className="h-5 w-5" />}
              label="Total Scrobbles"
              value={stats.total_scrobbles.toLocaleString()}
              color="text-green-400"
              loading={statsLoading}
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Listening Time"
              value={`${stats.total_listening_hours}h`}
              color="text-blue-400"
              loading={statsLoading}
            />
            <StatCard
              icon={<Users className="h-5 w-5" />}
              label="Unique Artists"
              value={stats.unique_artists.toLocaleString()}
              color="text-purple-400"
              loading={statsLoading}
            />
            <StatCard
              icon={<Disc3 className="h-5 w-5" />}
              label="Unique Tracks"
              value={stats.unique_tracks.toLocaleString()}
              color="text-orange-400"
              loading={statsLoading}
            />
          </div>
        ) : null}

        {/* Recent Scrobbles */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 mb-8">
          <h2 className="text-gray-100 font-mono font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            Recent Scrobbles
          </h2>
          {recentLoading && !recentScrobbles ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-green-500" />
            </div>
          ) : recentScrobbles?.scrobbles?.length ? (
            <div className="space-y-1">
              {recentScrobbles.scrobbles.map((scrobble, idx) => (
                <div key={`${scrobble.id}-${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                  <span className="text-gray-600 font-mono text-xs w-6 text-right shrink-0">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-200 font-mono text-sm truncate">{scrobble.title}</p>
                    <p className="text-gray-500 font-mono text-xs truncate">{scrobble.artist}</p>
                  </div>
                  <span className="text-gray-600 font-mono text-xs shrink-0">
                    {new Date(scrobble.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 font-mono text-sm text-center py-8">No scrobbles yet — start playing music!</p>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 mb-8">
          {/* Top Artists */}
          <div className="xl:col-span-5">
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
              <h2 className="text-gray-100 font-mono font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                Top Artists
              </h2>
              {artistsLoading && !topArtists ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                </div>
              ) : topArtists?.artists.length ? (
                <div className="space-y-2">
                  {topArtists.artists.map((artist) => (
                    <div key={artist.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                      <span className="text-gray-600 font-mono text-xs w-6 text-right">{artist.rank}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-200 font-mono text-sm truncate">{artist.name}</p>
                      </div>
                      <span className="text-gray-500 font-mono text-xs">{artist.plays} plays</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 font-mono text-sm text-center py-8">No data yet — start playing music!</p>
              )}
            </div>
          </div>

          {/* Top Tracks */}
          <div className="xl:col-span-7">
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
              <h2 className="text-gray-100 font-mono font-semibold mb-4 flex items-center gap-2">
                <Music className="h-4 w-4 text-green-400" />
                Top Tracks
              </h2>
              {tracksLoading && !topTracks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                </div>
              ) : topTracks?.tracks.length ? (
                <div className="space-y-2">
                  {topTracks.tracks.map((track) => (
                    <div key={`${track.title}-${track.artist}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                      <span className="text-gray-600 font-mono text-xs w-6 text-right">{track.rank}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-200 font-mono text-sm truncate">{track.title}</p>
                        <p className="text-gray-500 font-mono text-xs truncate">{track.artist}</p>
                      </div>
                      <span className="text-gray-500 font-mono text-xs">{track.plays} plays</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 font-mono text-sm text-center py-8">No data yet — start playing music!</p>
              )}
            </div>
          </div>
        </div>

        {/* Listening Activity */}
        {listeningStats?.daily && listeningStats.daily.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Daily Listening */}
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
              <h2 className="text-gray-100 font-mono font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                Daily Listening
              </h2>
              <div className="space-y-1">
                {listeningStats.daily.slice(-14).map((day) => {
                  const maxMinutes = Math.max(...listeningStats.daily.map(d => d.minutes), 1);
                  const barWidth = (day.minutes / maxMinutes) * 100;
                  return (
                    <div key={day.date} className="flex items-center gap-3">
                      <span className="text-gray-600 font-mono text-xs w-24 shrink-0">{day.date}</span>
                      <div className="flex-1 h-5 bg-gray-800 rounded overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="text-gray-500 font-mono text-xs w-16 text-right">{day.minutes}m</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hourly Distribution */}
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
              <h2 className="text-gray-100 font-mono font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-400" />
                Hourly Distribution
              </h2>
              <div className="flex items-end gap-1 h-32">
                {listeningStats.hourly.map((h) => {
                  const maxPlays = Math.max(...listeningStats.hourly.map(x => x.plays), 1);
                  const height = (h.plays / maxPlays) * 100;
                  return (
                    <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t transition-all duration-500 min-h-[2px]"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-gray-600 font-mono text-[8px]">
                        {h.hour.substring(0, 2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Heatmap */}
        {heatmapData?.heatmap && (
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 mb-8">
            <h2 className="text-gray-100 font-mono font-semibold mb-4">Listening Heatmap</h2>
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="flex gap-1">
                  <div className="flex flex-col gap-1 mr-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="h-5 flex items-center">
                        <span className="text-gray-600 font-mono text-[10px] w-8">{day}</span>
                      </div>
                    ))}
                  </div>
                  {heatmapData.heatmap[0]?.map((_, hourIdx) => (
                    <div key={hourIdx} className="flex flex-col gap-1">
                      {heatmapData.heatmap.map((day, dayIdx) => {
                        const value = day[hourIdx];
                        const maxVal = Math.max(...heatmapData.heatmap.flat(), 1);
                        const intensity = value / maxVal;
                        return (
                          <div
                            key={dayIdx}
                            className="h-5 w-5 rounded-sm"
                            style={{
                              backgroundColor: value > 0
                                ? `rgba(16, 185, 129, ${0.15 + intensity * 0.85})`
                                : 'rgba(31, 41, 55, 0.5)',
                            }}
                            title={`${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIdx]} ${String(hourIdx).padStart(2, '0')}:00 — ${value} plays`}
                          />
                        );
                      })}
                      {hourIdx % 3 === 0 && (
                        <span className="text-gray-600 font-mono text-[8px] text-center">
                          {String(hourIdx).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color, loading }: { icon: ReactNode; label: string; value: string; color: string; loading?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 relative overflow-hidden">
      {loading && (
        <div className="absolute top-2 right-2">
          <Loader2 className="h-3 w-3 animate-spin text-gray-600" />
        </div>
      )}
      <div className={`${color} mb-2`}>{icon}</div>
      <p className={`font-mono text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-gray-500 font-mono text-xs mt-1">{label}</p>
    </div>
  );
}
