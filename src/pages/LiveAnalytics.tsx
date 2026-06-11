import { useState, useEffect, type ReactNode } from 'react';
import {
  useSpotifyNowPlaying,
  useSpotifyRecentlyPlayed,
  useSpotifyTopArtists,
  useSpotifyTopTracks,
} from '../hooks/useSpotifyData';
import { NavBar } from '../components/NavBar';
import {
  Loader2, Music, Clock, Users, Disc3, TrendingUp, Calendar, Activity,
  ExternalLink, Settings, LogOut, LogIn, Zap,
} from 'lucide-react';
import {
  isSpotifyAuthenticated,
  startSpotifyAuth,
  handleSpotifyCallback,
  clearTokenData,
} from '../services/spotifyApi';

type Period = '7d' | '30d' | '90d' | '1y' | 'all';
type TopTimeRange = 'short_term' | 'medium_term' | 'long_term';

const TOP_RANGES: { value: TopTimeRange; label: string }[] = [
  { value: 'short_term', label: '4 Weeks' },
  { value: 'medium_term', label: '6 Months' },
  { value: 'long_term', label: 'All Time' },
];

export function LiveAnalytics() {
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(localStorage.getItem('spotify_client_id') || '');
  const [topRange, setTopRange] = useState<TopTimeRange>('medium_term');

  // --- Spotify Web API Data (Tier 1 - only data source) ---
  const { data: nowPlayingData, loading: nowPlayingLoading } = useSpotifyNowPlaying();
  const { data: recentlyPlayedData, loading: recentLoading } = useSpotifyRecentlyPlayed(20);
  const { data: spotifyTopArtists, loading: spotifyArtistsLoading } = useSpotifyTopArtists(topRange, 10);
  const { data: spotifyTopTracks, loading: spotifyTracksLoading } = useSpotifyTopTracks(topRange, 10);

  const [liveIndicator, setLiveIndicator] = useState(false);

  // --- Auth initialization ---
  useEffect(() => {
    // Check for Spotify OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.has('code')) {
      handleSpotifyCallback().then((success) => {
        if (success) setSpotifyConnected(true);
      });
    } else {
      setSpotifyConnected(isSpotifyAuthenticated());
      setCheckingAuth(false);
    }
  }, []);

  // --- Live indicator ---
  useEffect(() => {
    if (nowPlayingData?.is_playing) {
      setLiveIndicator(true);
      const timeout = setTimeout(() => setLiveIndicator(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [nowPlayingData?.is_playing]);

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
      localStorage.setItem('spotify_client_id', clientIdInput.trim());
      setShowSettings(false);
    }
  };

  // --- Loading ---
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <p className="text-gray-400 font-mono">Connecting to Spotify...</p>
      </div>
    );
  }

  // --- Not connected ---
  if (!spotifyConnected) {
    return (
      <div className="min-h-screen bg-black">
        <NavBar currentPage="live" />
        <main className="container mx-auto px-4 lg:px-6 py-10 max-w-[900px]">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold font-mono text-green-400 mb-2">Live Analytics</h1>
            <p className="text-gray-400 font-mono">Connect your Spotify account to see your listening data in real time</p>
          </div>

          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-6 max-w-md mx-auto">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-100 font-mono font-semibold mb-1">Connect to Spotify</h3>
                <p className="text-gray-400 font-mono text-sm mb-4">
                  Sign in with Spotify to see now playing, recently played, top artists, and top tracks — instantly.
                  <br /><br />
                  <span className="text-gray-500 text-xs">Requires Spotify Premium for now-playing data.</span>
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

          <div className="mt-8 text-center text-gray-600 font-mono text-sm max-w-md mx-auto">
            <p>No extension needed. No local server. Just your Spotify account.</p>
          </div>
        </main>
      </div>
    );
  }

  // --- Main Dashboard ---
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
                liveIndicator || nowPlayingData?.is_playing
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-gray-800 text-gray-500 border border-gray-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  liveIndicator || nowPlayingData?.is_playing ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
                }`}></span>
                {nowPlayingData?.is_playing ? 'PLAYING' : 'IDLE'}
              </div>
            </div>
            <p className="text-gray-500 font-mono text-sm">
              Spotify connected — real-time data from your account
              {nowPlayingData?.is_playing && <span className="text-green-400 ml-2">🎵</span>}
            </p>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Now Playing — from Spotify Web API (polling) */}
        {nowPlayingData?.is_playing && nowPlayingData.track && (
          <div className="mb-8 p-4 rounded-lg border border-green-500/20 bg-green-500/5">
            <div className="flex items-center gap-4">
              {nowPlayingData.track.album?.images?.[0]?.url && (
                <img
                  src={nowPlayingData.track.album.images[0].url}
                  alt={nowPlayingData.track.album.name}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-green-400 font-mono text-xs mb-1 flex items-center gap-2">
                  <Activity className="h-3 w-3 animate-pulse" />
                  NOW PLAYING
                </p>
                <p className="text-gray-100 font-mono text-sm font-semibold truncate">
                  {nowPlayingData.track.name}
                </p>
                <p className="text-gray-400 font-mono text-xs truncate">
                  {nowPlayingData.track.artists.map(a => a.name).join(', ')}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-gray-500 font-mono text-xs">
                  {Math.floor(nowPlayingData.progress_ms / 60000)}:{String(Math.floor((nowPlayingData.progress_ms % 60000) / 1000)).padStart(2, '0')}
                  {' / '}
                  {Math.floor(nowPlayingData.track.duration_ms / 60000)}:{String(Math.floor((nowPlayingData.track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                </p>
                {nowPlayingData.track.external_urls?.spotify && (
                  <a
                    href={nowPlayingData.track.external_urls.spotify}
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
        )}

        {/* Quick Stats from Top Data */}
        {spotifyTopArtists?.items && spotifyTopTracks?.items && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Music className="h-5 w-5" />} label="Top Artists" value={spotifyTopArtists.items.length} color="text-purple-400" />
            <StatCard icon={<Disc3 className="h-5 w-5" />} label="Top Tracks" value={spotifyTopTracks.items.length} color="text-green-400" />
            <StatCard icon={<Users className="h-5 w-5" />} label="Unique Artists (4w)" value={spotifyTopArtists.total} color="text-blue-400" />
            <StatCard icon={<Zap className="h-5 w-5" />} label="Time Range" value={topRange === 'short_term' ? '4 Weeks' : topRange === 'medium_term' ? '6 Months' : 'All Time'} color="text-yellow-400" />
          </div>
        )}

        {/* Recently Played — from Spotify Web API */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 mb-8">
          <h2 className="text-gray-100 font-mono font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            Recently Played (last 50)
            {recentLoading && <Loader2 className="h-3 w-3 animate-spin text-gray-600 ml-2" />}
            <span className="text-gray-600 text-[10px] ml-1">· Spotify API</span>
          </h2>
          {recentLoading && !recentlyPlayedData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-green-500" />
            </div>
          ) : recentlyPlayedData?.items?.length ? (
            <div className="space-y-1">
              {recentlyPlayedData.items.map((item, idx) => (
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

        {/* Top Artists + Top Tracks */}
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
              ) : spotifyTopArtists?.items?.length ? (
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
              ) : spotifyTopTracks?.items?.length ? (
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

        {/* Note: Custom stats (heatmap, hourly distribution) removed in Tier 1.
             They require raw scrobble data which isn't available via Spotify Web API alone.
             These features would require the browser extension or Last.fm integration. */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-6 mb-8">
          <h2 className="text-gray-100 font-mono font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            Tier 1 Only — Power Features
          </h2>
          <p className="text-gray-400 font-mono text-sm mb-4">
            This version uses <strong>only the Spotify Web API</strong> — no extension, no local server.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-900/50 rounded-lg border border-green-500/20">
              <h3 className="text-green-400 font-mono text-sm mb-2">✅ What Works</h3>
              <ul className="space-y-1 text-gray-400 font-mono text-xs">
                <li>• Now Playing (3s polling)</li>
                <li>• Recently Played (last 50)</li>
                <li>• Top Artists (4w / 6m / All)</li>
                <li>• Top Tracks (4w / 6m / All)</li>
                <li>• Works on any browser/device</li>
                <li>• Zero setup beyond OAuth</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg border border-yellow-500/20">
              <h3 className="text-yellow-400 font-mono text-sm mb-2">⚠️ Not Available (Tier 1)</h3>
              <ul className="space-y-1 text-gray-400 font-mono text-xs">
                <li>• Heatmap (needs raw scrobbles)</li>
                <li>• Hourly/Daily distribution</li>
                <li>• Full listening history</li>
                <li>• Instant now-playing (3s polling)</li>
                <li>• Free tier now-playing (Premium req)</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 relative overflow-hidden">
      <div className={`${color} mb-2`}>{icon}</div>
      <p className={`font-mono text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-gray-500 font-mono text-xs mt-1">{label}</p>
    </div>
  );
}