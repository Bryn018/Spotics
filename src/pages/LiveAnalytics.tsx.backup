import { useState, useEffect, type ReactNode } from 'react';
import {
  useSpotifyNowPlaying,
  useSpotifyRecentlyPlayed,
  useSpotifyTopArtists,
  useSpotifyTopTracks,
} from '../hooks/useSpotifyData';
import {
  useServiceNowPlaying,
  useServiceRecentlyPlayed,
  useServicePlayerState,
  useServiceHealth,
} from '../hooks/useSpotifyService';
import {
  useScrobbleStats,
  useListeningStats,
  useHeatmap,
} from '../hooks/useScrobbleData';
import { ScrobblerConnect } from '../components/ScrobblerConnect';
import { NavBar } from '../components/NavBar';
import {
  Loader2, Music, Clock, Users, Disc3, TrendingUp, Calendar, Activity,
  ExternalLink, Settings, LogOut, LogIn, Wifi, WifiOff,
} from 'lucide-react';
import {
  isSpotifyAuthenticated,
  startSpotifyAuth,
  handleSpotifyCallback,
  clearTokenData,
} from '../services/spotifyApi';
import { validateKey } from '../services/scrobbleApi';

type Period = '7d' | '30d' | '90d' | '1y' | 'all';
type TopTimeRange = 'short_term' | 'medium_term' | 'long_term';

const PERIODS: { value: Period; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
];

const TOP_RANGES: { value: TopTimeRange; label: string }[] = [
  { value: 'short_term', label: '4 Weeks' },
  { value: 'medium_term', label: '6 Months' },
  { value: 'long_term', label: 'All Time' },
];

export function LiveAnalytics() {
  // --- Auth states ---
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [scrobblerConnected, setScrobblerConnected] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // --- Spotify data (primary) ---
  const { data: nowPlayingData, loading: nowPlayingLoading } = useSpotifyNowPlaying();
  const { data: recentlyPlayedData, loading: recentLoading } = useSpotifyRecentlyPlayed(20);
  const { data: spotifyTopArtists, loading: spotifyArtistsLoading } = useSpotifyTopArtists('medium_term', 10);
  const { data: spotifyTopTracks, loading: spotifyTracksLoading } = useSpotifyTopTracks('medium_term', 10);

  // --- SpotAPI Service data (local Python service — faster now-playing + player state) ---
  const { data: serviceNowPlaying } = useServiceNowPlaying();
  const { data: serviceRecentlyPlayed } = useServiceRecentlyPlayed(20);
  const { data: servicePlayerState } = useServicePlayerState();
  const { data: serviceHealth } = useServiceHealth();
  const serviceAvailable = serviceHealth?.status === 'ok';

  // --- Worker data (supplementary — custom stats) ---
  const [period, setPeriod] = useState<Period>('30d');
  const [topRange, setTopRange] = useState<TopTimeRange>('medium_term');
  const { data: stats, loading: statsLoading, lastUpdated: statsUpdated } = useScrobbleStats(period);
  const { data: listeningStats, loading: listeningLoading } = useListeningStats(period);
  const { data: heatmapData, loading: heatmapLoading } = useHeatmap(period);

  const [liveIndicator, setLiveIndicator] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(localStorage.getItem('spotify_client_id') || '');

  // --- Auth initialization ---
  useEffect(() => {
    // Check for Spotify OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.has('code')) {
      handleSpotifyCallback().then((success) => {
        if (success) {
          setSpotifyConnected(true);
        }
      });
    } else {
      setSpotifyConnected(isSpotifyAuthenticated());
    }

    // Check for scrobbler API key
    const key = localStorage.getItem('spotics_api_key');
    if (key) {
      validateKey(key).then((valid) => {
        if (valid) {
          setScrobblerConnected(true);
        } else {
          localStorage.removeItem('spotics_api_key');
        }
        setCheckingAuth(false);
      });
    } else {
      setCheckingAuth(false);
    }
  }, []);

  // --- Poll for scrobbler key (extension bridge sync) ---
  useEffect(() => {
    if (scrobblerConnected) return;
    const interval = setInterval(async () => {
      const key = localStorage.getItem('spotics_api_key');
      if (key) {
        const valid = await validateKey(key);
        if (valid) {
          setScrobblerConnected(true);
          clearInterval(interval);
        } else {
          localStorage.removeItem('spotics_api_key');
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [scrobblerConnected]);

  // --- Live indicator ---
  useEffect(() => {
    if (statsUpdated) {
      setLiveIndicator(true);
      const timeout = setTimeout(() => setLiveIndicator(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [statsUpdated]);

  // --- Handlers ---
  const handleSpotifyConnect = async () => {
    if (!localStorage.getItem('spotify_client_id')) {
      setShowSettings(true);
      return;
    }
    try {
      await startSpotifyAuth();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start Spotify auth');
    }
  };

  const handleSpotifyDisconnect = () => {
    clearTokenData();
    setSpotifyConnected(false);
  };

  const handleSaveClientId = () => {
    if (clientIdInput.trim()) {
      localStorage.setItem('spotics_client_id', clientIdInput.trim());
      setShowSettings(false);
    }
  };

  // --- Loading state ---
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <p className="text-gray-400 font-mono">Verifying connection...</p>
      </div>
    );
  }

  // --- Not connected to either service ---
  if (!spotifyConnected && !scrobblerConnected) {
    return (
      <div className="min-h-screen bg-black">
        <NavBar currentPage="live" />
        <main className="container mx-auto px-4 lg:px-6 py-10 max-w-[900px]">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold font-mono text-green-400 mb-2">Live Analytics</h1>
            <p className="text-gray-400 font-mono">Connect to Spotify to see your listening data in real time</p>
          </div>

          <div className="space-y-4">
            {/* Spotify Connect */}
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-100 font-mono font-semibold mb-1">Connect to Spotify</h3>
                  <p className="text-gray-400 font-mono text-sm mb-4">
                    Sign in with Spotify to see now playing, recently played, top artists, and top tracks — instantly.
                  </p>
                  <button
                    type="button"
                    onClick={handleSpotifyConnect}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-mono text-sm transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    Connect Spotify
                  </button>
                </div>
              </div>
            </div>

            {/* Scrobbler Connect */}
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-100 font-mono font-semibold mb-1">Scrobbler Extension</h3>
                  <p className="text-gray-400 font-mono text-sm mb-4">
                    For advanced stats (heatmap, hourly distribution, daily listening), connect the browser extension.
                  </p>
                  <ScrobblerConnect onConnected={() => setScrobblerConnected(true)} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- Main Dashboard ---
  const isLoading = statsLoading && !stats && scrobblerConnected;

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
                liveIndicator || (nowPlayingData?.is_playing)
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-gray-800 text-gray-500 border border-gray-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  liveIndicator || (nowPlayingData?.is_playing) ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
                }`}></span>
                {nowPlayingData?.is_playing ? 'PLAYING' : 'IDLE'}
              </div>
            </div>
            <p className="text-gray-500 font-mono text-sm">
              {spotifyConnected && scrobblerConnected
                ? 'Spotify + Scrobbler connected — full analytics'
                : spotifyConnected
                  ? 'Spotify connected — connect scrobbler for advanced stats'
                  : 'Scrobbler connected'}
              {statsUpdated && (
                <span className="text-gray-600 ml-2">· Updated: {statsUpdated.toLocaleTimeString()}</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Period Selector (for scrobbler stats) */}
            {scrobblerConnected && (
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
            )}

            {/* Spotify status & settings */}
            <div className="flex items-center gap-2">
              {spotifyConnected && (
                <button
                  type="button"
                  onClick={handleSpotifyDisconnect}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 font-mono text-xs hover:text-red-400 transition-colors"
                  title="Disconnect Spotify"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Spotify</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 font-mono text-xs hover:text-gray-200 transition-colors"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-8 p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <h3 className="text-gray-100 font-mono font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-400" />
              Spotify App Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 font-mono text-xs block mb-2">
                  Spotify Client ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    placeholder="Your Spotify App Client ID"
                    className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-gray-100 font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:border-green-500/50"
                  />
                  <button
                    type="button"
                    onClick={handleSaveClientId}
                    className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-sm hover:bg-green-500/20 transition-colors"
                  >
                    Save
                  </button>
                </div>
                <p className="text-gray-600 font-mono text-xs mt-2">
                  Create an app at{' '}
                  <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                    developer.spotify.com/dashboard
                  </a>
                  {' '}and add <code className="text-gray-400">{window.location.origin}</code> as a Redirect URI.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Now Playing — prefer SpotAPI service (faster), fallback to Web API */}
        {(() => {
          const np = serviceAvailable && serviceNowPlaying?.is_playing ? serviceNowPlaying
            : spotifyConnected && nowPlayingData?.is_playing ? nowPlayingData : null;
          const track = np?.track;
          if (!np || !track) return null;
          return (
            <div className="mb-8 p-4 rounded-lg border border-green-500/20 bg-green-500/5">
              <div className="flex items-center gap-4">
                {track.album?.images?.[0]?.url && (
                  <img
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-green-400 font-mono text-xs mb-1 flex items-center gap-2">
                    <Activity className="h-3 w-3 animate-pulse" />
                    NOW PLAYING
                    {serviceAvailable && <span className="text-gray-600 text-[10px] ml-1">· SpotAPI</span>}
                  </p>
                  <p className="text-gray-100 font-mono text-sm font-semibold truncate">
                    {track.name}
                  </p>
                  <p className="text-gray-400 font-mono text-xs truncate">
                    {track.artists.map(a => a.name).join(', ')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-gray-500 font-mono text-xs">
                    {Math.floor(np.progress_ms / 60000)}:{String(Math.floor((np.progress_ms % 60000) / 1000)).padStart(2, '0')}
                    {' / '}
                    {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                  </p>
                  {track.external_urls?.spotify && (
                    <a
                      href={track.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mt-1" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Stats Overview — from Scrobbler or Spotify */}
        {scrobblerConnected && (stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Music className="h-5 w-5" />} label="Total Scrobbles" value={stats.total_scrobbles.toLocaleString()} color="text-green-400" loading={statsLoading} />
            <StatCard icon={<Clock className="h-5 w-5" />} label="Listening Time" value={`${stats.total_listening_hours}h`} color="text-blue-400" loading={statsLoading} />
            <StatCard icon={<Users className="h-5 w-5" />} label="Unique Artists" value={stats.unique_artists.toLocaleString()} color="text-purple-400" loading={statsLoading} />
            <StatCard icon={<Disc3 className="h-5 w-5" />} label="Unique Tracks" value={stats.unique_tracks.toLocaleString()} color="text-orange-400" loading={statsLoading} />
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-green-500" />
          </div>
        ) : null)}

        {/* Recently Played — prefer SpotAPI service, fallback to Web API */}
        {(() => {
          const recent = serviceAvailable && serviceRecentlyPlayed?.items?.length
            ? serviceRecentlyPlayed
            : spotifyConnected && recentlyPlayedData?.items?.length
              ? recentlyPlayedData : null;
          const loading = serviceAvailable ? false : recentLoading;
          if (!recent && !loading) return null;
          return (
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 mb-8">
              <h2 className="text-gray-100 font-mono font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                Recently Played
                {loading && <Loader2 className="h-3 w-3 animate-spin text-gray-600 ml-2" />}
              </h2>
              {loading && !recent ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                </div>
              ) : recent?.items?.length ? (
                <div className="space-y-1">
                  {recent.items.map((item, idx) => (
                    <div key={`${item.track?.id}-${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                      {item.track?.album?.images?.[2]?.url && (
                        <img src={item.track.album.images[2].url} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                      )}
                      <span className="text-gray-600 font-mono text-xs w-6 text-right shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-200 font-mono text-sm truncate">{item.track?.name}</p>
                        <p className="text-gray-500 font-mono text-xs truncate">{item.track?.artists?.map(a => a.name).join(', ')}</p>
                      </div>
                      <span className="text-gray-600 font-mono text-xs shrink-0">
                        {item.played_at ? new Date(item.played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 font-mono text-sm text-center py-8">No recent tracks — start playing music!</p>
              )}
            </div>
          );
        })()}

            {/* Main Content Grid: Top Artists + Top Tracks */}
        {spotifyConnected && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 mb-8">
            {/* Top Artists */}
            <div className="xl:col-span-5">
              <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-gray-100 font-mono font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                    Top Artists
                  </h2>
                  <div className="flex gap-1">
                    {TOP_RANGES.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setTopRange(r.value)}
                        className={`px-2 py-1 rounded font-mono text-[10px] transition-colors ${
                          topRange === r.value
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'text-gray-600 hover:text-gray-400'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                {spotifyArtistsLoading && !spotifyTopArtists ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                  </div>
                ) : spotifyTopArtists?.items.length ? (
                  <div className="space-y-2">
                    {spotifyTopArtists.items.map((artist, idx) => (
                      <div key={artist.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                        <span className="text-gray-600 font-mono text-xs w-6 text-right">{idx + 1}</span>
                        {artist.images?.[2]?.url && (
                          <img src={artist.images[2].url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-200 font-mono text-sm truncate">{artist.name}</p>
                          {artist.genres?.[0] && (
                            <p className="text-gray-600 font-mono text-[10px] truncate">{artist.genres[0]}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-gray-500 font-mono text-xs">{artist.popularity}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 font-mono text-sm text-center py-8">No data yet</p>
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
                {spotifyTracksLoading && !spotifyTopTracks ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                  </div>
                ) : spotifyTopTracks?.items.length ? (
                  <div className="space-y-2">
                    {spotifyTopTracks.items.map((track, idx) => (
                      <div key={track.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                        <span className="text-gray-600 font-mono text-xs w-6 text-right">{idx + 1}</span>
                        {track.album?.images?.[2]?.url && (
                          <img src={track.album.images[2].url} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-200 font-mono text-sm truncate">{track.name}</p>
                          <p className="text-gray-500 font-mono text-xs truncate">{track.artists.map(a => a.name).join(', ')}</p>
                        </div>
                        <span className="text-gray-600 font-mono text-xs shrink-0">
                          {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 font-mono text-sm text-center py-8">No data yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Listening Activity — from Scrobbler (custom stats) */}
        {scrobblerConnected && listeningStats?.daily && listeningStats.daily.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                        <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded transition-all duration-500" style={{ width: `${barWidth}%` }} />
                      </div>
                      <span className="text-gray-500 font-mono text-xs w-16 text-right">{day.minutes}m</span>
                    </div>
                  );
                })}
              </div>
            </div>

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
                      <div className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t transition-all duration-500 min-h-[2px]" style={{ height: `${height}%` }} />
                      <span className="text-gray-600 font-mono text-[8px]">{h.hour.substring(0, 2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Heatmap — from Scrobbler */}
        {scrobblerConnected && heatmapData?.heatmap && (
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
