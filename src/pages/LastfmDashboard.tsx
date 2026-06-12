import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  isLastfmConnected,
  getLastfmUsername,
  getLastfmApiKey,
  startLastfmAuth,
  clearLastfmData,
  getLastfmRecentTracks,
  getLastfmTopArtists,
  getLastfmTopTracks,
  getLastfmUserInfo,
  convertLastfmRecentTrack,
  convertLastfmTopArtist,
  convertLastfmTopTrack,
  mapPeriodToLastfm,
  type LastfmRecentTrack,
  type LastfmTopArtist,
  type LastfmTopTrack,
  type LastfmUserInfo,
} from '../services/lastfmApi';
import { NavBar } from '../components/NavBar';
import {
  Loader2, Music, Clock, Users, Disc3, TrendingUp, Heart,
  ExternalLink, Settings, LogOut, LogIn, AlertCircle, ChevronLeft,
  ChevronRight, Terminal, Radio,
} from 'lucide-react';

type Tab = 'overview' | 'recent' | 'artists' | 'tracks';
type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

const TOP_RANGES: { value: TimeRange; label: string; lastfm: string }[] = [
  { value: '7d', label: '7 Days', lastfm: '7day' },
  { value: '30d', label: '1 Month', lastfm: '1month' },
  { value: '90d', label: '3 Months', lastfm: '3month' },
  { value: '1y', label: '1 Year', lastfm: '12month' },
  { value: 'all', label: 'All Time', lastfm: 'overall' },
];

export function LastfmDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [apiKeyInput, setApiKeyInput] = useState(getLastfmApiKey() || '');
  const [showSettings, setShowSettings] = useState(false);

  // Data states
  const [connected, setConnected] = useState(isLastfmConnected());
  const [username, setUsername] = useState(getLastfmUsername());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API data
  const [recentTracks, setRecentTracks] = useState<ReturnType<typeof convertLastfmRecentTrack>[]>([]);
  const [recentPage, setRecentPage] = useState(1);
  const [recentTotal, setRecentTotal] = useState(0);
  const [topArtists, setTopArtists] = useState<ReturnType<typeof convertLastfmTopArtist>[]>([]);
  const [topTracks, setTopTracks] = useState<ReturnType<typeof convertLastfmTopTrack>[]>([]);
  const [userInfo, setUserInfo] = useState<LastfmUserInfo | null>(null);

  // Form state
  const [apiSecretInput, setApiSecretInput] = useState('');

  // Remove unused variable
  const fetchRecentTracks = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLastfmRecentTracks(page, 50);
      setRecentTracks(data.recenttracks.track.map(convertLastfmRecentTrack));
      setRecentPage(page);
      setRecentTotal(parseInt(data.recenttracks['@attr'].total) || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recent tracks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTopArtists = useCallback(async (period: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLastfmTopArtists(period, 25);
      setTopArtists(data.topartists.artist.map(convertLastfmTopArtist));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch top artists');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTopTracks = useCallback(async (period: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLastfmTopTracks(period, 25);
      setTopTracks(data.toptracks.track.map(convertLastfmTopTrack));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch top tracks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserInfo = useCallback(async () => {
    try {
      const data = await getLastfmUserInfo();
      setUserInfo(data);
      setUsername(data.user.name);
    } catch {
      // Silently fail — user info is optional
    }
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (!connected) return;
    switch (activeTab) {
      case 'overview':
        fetchRecentTracks(1);
        fetchUserInfo();
        break;
      case 'recent':
        fetchRecentTracks(recentPage);
        break;
      case 'artists':
        fetchTopArtists(mapPeriodToLastfm(timeRange));
        break;
      case 'tracks':
        fetchTopTracks(mapPeriodToLastfm(timeRange));
        break;
    }
  }, [activeTab, connected, timeRange, recentPage, fetchRecentTracks, fetchTopArtists, fetchTopTracks, fetchUserInfo]);

  // --- Handlers ---
  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('lastfm_api_key', apiKeyInput.trim());
    }
    if (apiSecretInput.trim()) {
      localStorage.setItem('lastfm_api_secret', apiSecretInput.trim());
    }
    setShowSettings(false);
  };

  const handleConnect = () => {
    if (!apiKeyInput.trim()) {
      setShowSettings(true);
      return;
    }
    if (!apiSecretInput.trim()) {
      alert('Last.fm API Secret is required for authentication.');
      return;
    }
    localStorage.setItem('lastfm_api_key', apiKeyInput.trim());
    localStorage.setItem('lastfm_api_secret', apiSecretInput.trim());
    startLastfmAuth();
  };

  const handleDisconnect = () => {
    clearLastfmData();
    setConnected(false);
    setUsername(null);
    setRecentTracks([]);
    setTopArtists([]);
    setTopTracks([]);
    setUserInfo(null);
  };

  // --- Loading ---
  if (loading && !recentTracks.length && !topArtists.length && !topTracks.length) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-gray-400 font-mono">Loading Last.fm data...</p>
      </div>
    );
  }

  // --- Not connected ---
  if (!connected) {
    return (
      <div className="min-h-screen bg-black">
        <NavBar currentPage="analytics" />
        <main className="container mx-auto px-4 lg:px-6 py-10 max-w-[900px]">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Radio className="h-8 w-8 text-orange-500" />
              <h1 className="text-3xl font-bold font-mono text-orange-400">Last.fm Connect</h1>
            </div>
            <p className="text-gray-400 font-mono">
              Connect your Last.fm account to see your complete listening history
            </p>
          </div>

          <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-6 max-w-lg mx-auto">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Radio className="h-5 w-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-gray-100 font-mono font-semibold mb-1">Connect to Last.fm</h3>
                <p className="text-gray-400 font-mono text-sm mb-4">
                  Last.fm tracks what you listen to across all devices — no extension needed.
                  <br /><br />
                  <span className="text-gray-500 text-xs">Connect Spotify to Last.fm in your Last.fm settings for automatic scrobbling.</span>
                </p>

                {/* API Key and Secret Input */}
                <div className="mb-4 space-y-3">
                  <div>
                    <label className="text-gray-400 font-mono text-xs block mb-2">
                      Last.fm API Key
                    </label>
                    <input
                      type="text"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Get from last.fm/api/account/create"
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-gray-100 font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 font-mono text-xs block mb-2">
                      Last.fm API Secret
                    </label>
                    <input
                      type="password"
                      value={apiSecretInput}
                      onChange={(e) => setApiSecretInput(e.target.value)}
                      placeholder="Shared secret from Last.fm API account page"
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-gray-100 font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50"
                    />
                    <p className="text-gray-600 font-mono text-xs mt-1">
                      Required for authentication. Stored locally and never sent to any server.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnect}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-mono text-sm transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    Connect to Last.fm
                  </button>
                  <p className="text-gray-600 font-mono text-xs mt-2">
                    Get both from{' '}
                    <a href="https://www.last.fm/api/account/create" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
                      last.fm/api/account/create
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="mt-8 p-6 rounded-lg bg-gray-900/50 border border-gray-800 max-w-lg mx-auto">
            <h2 className="text-orange-400 font-mono text-sm mb-4 flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              Setup Instructions
            </h2>
            <ol className="space-y-3 text-gray-400 font-mono text-sm">
              <li className="flex items-start gap-3">
                <span className="text-orange-500 shrink-0">1.</span>
                <span>Create a free Last.fm account at <span className="text-orange-400">last.fm</span> (if you don't have one)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500 shrink-0">2.</span>
                <span>Get your API key from <span className="text-orange-400">last.fm/api/account/create</span></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500 shrink-0">3.</span>
                <span>Connect Spotify to Last.fm: Go to <span className="text-orange-400">last.fm/settings/applications</span> and link your Spotify</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500 shrink-0">4.</span>
                <span>Enter your API key above and click Connect — authorize on Last.fm</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500 shrink-0">5.</span>
                <span>Done! Your listening history will appear here automatically.</span>
              </li>
            </ol>
          </div>

          <div className="mt-6 text-center text-gray-600 font-mono text-sm max-w-lg mx-auto">
            <p>Save scrobbles from Spotify, Apple Music, YouTube — anywhere you listen.</p>
          </div>
        </main>
      </div>
    );
  }

  // --- Main Dashboard ---
  const totalPages = Math.ceil(recentTotal / 50);

  return (
    <div className="min-h-screen bg-black">
      <NavBar currentPage="analytics" />
      <main className="container mx-auto px-4 lg:px-6 py-6 lg:py-10 max-w-[1600px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Radio className="h-7 w-7 text-orange-500" />
              <h1 className="text-3xl font-bold font-mono text-orange-400">Last.fm</h1>
              {username && (
                <span className="text-gray-500 font-mono text-sm">@{username}</span>
              )}
            </div>
            <p className="text-gray-500 font-mono text-sm">
              Your complete listening history — auto-synced from Spotify
            </p>
          </div>

          <div className="flex items-center gap-2">
            {connected && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 font-mono text-xs hover:text-red-400 transition-colors"
                title="Disconnect Last.fm"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Disconnect</span>
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

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-8 p-6 rounded-lg border border-gray-800 bg-gray-900/50">
            <h3 className="text-gray-100 font-mono font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-400" />
              Last.fm Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 font-mono text-xs block mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-gray-100 font-mono text-sm focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <div>
                <label className="text-gray-400 font-mono text-xs block mb-2">
                  API Secret
                </label>
                <input
                  type="password"
                  value={apiSecretInput}
                  onChange={(e) => setApiSecretInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-gray-100 font-mono text-sm focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-sm hover:bg-orange-500/20 transition-colors"
              >
                Save Settings
              </button>
            </div>
            {userInfo && (
                <div className="text-gray-500 font-mono text-xs space-y-1">
                  <p>Total scrobbles: <span className="text-gray-300">{parseInt(userInfo.user.playcount).toLocaleString()}</span></p>
                  <p>Artists: <span className="text-gray-300">{parseInt(userInfo.user.artistcount).toLocaleString()}</span></p>
                  <p>Albums: <span className="text-gray-300">{parseInt(userInfo.user.albumcount).toLocaleString()}</span></p>
                  <p>Tracks: <span className="text-gray-300">{parseInt(userInfo.user.trackcount).toLocaleString()}</span></p>
                </div>
              )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-gray-800 pb-4">
          {([
            { id: 'overview', label: 'Overview' },
            { id: 'recent', label: 'Recent Tracks' },
            { id: 'artists', label: 'Top Artists' },
            { id: 'tracks', label: 'Top Tracks' },
          ] as { id: Tab; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-mono text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Time range selector for artists/tracks tabs */}
          {(activeTab === 'artists' || activeTab === 'tracks') && (
            <div className="flex gap-1 ml-auto">
              {TOP_RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setTimeRange(r.value)}
                  className={`px-2 py-1 rounded font-mono text-[10px] transition-colors ${
                    timeRange === r.value
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-mono text-sm">{error}</p>
              <p className="text-red-400/60 font-mono text-xs mt-1">
                {error.includes('401') || error.includes('Invalid') ? 'Try disconnecting and reconnecting your Last.fm account.' : 'Please try again.'}
              </p>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab
            recentTracks={recentTracks}
            userInfo={userInfo}
            loading={loading}
            onConnectMore={() => setActiveTab('recent')}
          />
        )}

        {activeTab === 'recent' && (
          <RecentTracksTab
            tracks={recentTracks}
            page={recentPage}
            totalPages={totalPages}
            loading={loading}
            onPageChange={setRecentPage}
          />
        )}

        {activeTab === 'artists' && (
          <TopArtistsTab
            artists={topArtists}
            loading={loading}
            timeRange={timeRange}
          />
        )}

        {activeTab === 'tracks' && (
          <TopTracksTab
            tracks={topTracks}
            loading={loading}
            timeRange={timeRange}
          />
        )}
      </main>
    </div>
  );
}

// --- Overview Tab ---
function OverviewTab({
  recentTracks,
  userInfo,
  loading,
  onConnectMore,
}: {
  recentTracks: ReturnType<typeof convertLastfmRecentTrack>[];
  userInfo: LastfmUserInfo | null;
  loading: boolean;
  onConnectMore: () => void;
}) {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      {userInfo && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Music className="h-5 w-5" />} label="Total Scrobbles" value={parseInt(userInfo.user.playcount).toLocaleString()} color="text-orange-400" />
          <StatCard icon={<Users className="h-5 w-5" />} label="Artists" value={parseInt(userInfo.user.artistcount).toLocaleString()} color="text-purple-400" />
          <StatCard icon={<Disc3 className="h-5 w-5" />} label="Albums" value={parseInt(userInfo.user.albumcount).toLocaleString()} color="text-blue-400" />
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Tracks" value={parseInt(userInfo.user.trackcount).toLocaleString()} color="text-green-400" />
        </div>
      )}

      {/* Recent Tracks Preview */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-100 font-mono font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            Recently Played
          </h2>
          {recentTracks.length > 0 && (
            <button
              onClick={onConnectMore}
              className="text-gray-500 font-mono text-xs hover:text-orange-400 transition-colors flex items-center gap-1"
            >
              View all
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {loading && recentTracks.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
          </div>
        ) : recentTracks.length > 0 ? (
          <div className="space-y-1">
            {recentTracks.slice(0, 10).map((track, idx) => (
              <div key={`${track.title}-${track.artist}-${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                {track.image && (
                  <img src={track.image} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                )}
                <span className="text-gray-600 font-mono text-xs w-6 text-right shrink-0">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-200 font-mono text-sm truncate">{track.title}</p>
                  <p className="text-gray-500 font-mono text-xs truncate">{track.artist}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {track.loved && <Heart className="h-3 w-3 text-red-400 fill-red-400" />}
                  <span className="text-gray-600 font-mono text-xs">
                    {new Date(track.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 font-mono text-sm text-center py-8">No recent tracks yet. Start listening!</p>
        )}
      </div>

      {/* Info Banner */}
      <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-6">
        <h3 className="text-orange-400 font-mono font-semibold mb-2 flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          How It Works
        </h3>
        <p className="text-gray-400 font-mono text-sm mb-4">
          Last.fm automatically records what you listen to on Spotify (once you connect them).
          This dashboard shows your complete history — no extension, no manual uploads.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-black/30 rounded-lg border border-gray-800">
            <p className="text-orange-400 font-mono font-semibold mb-1">1. Connect</p>
            <p className="text-gray-500 font-mono">Link Last.fm + Spotify in your Last.fm settings</p>
          </div>
          <div className="p-3 bg-black/30 rounded-lg border border-gray-800">
            <p className="text-orange-400 font-mono font-semibold mb-1">2. Listen</p>
            <p className="text-gray-500 font-mono">Play music anywhere — phone, desktop, web</p>
          </div>
          <div className="p-3 bg-black/30 rounded-lg border border-gray-800">
            <p className="text-orange-400 font-mono font-semibold mb-1">3. View</p>
            <p className="text-gray-500 font-mono">Your scrobbles appear here automatically</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Recent Tracks Tab ---
function RecentTracksTab({
  tracks,
  page,
  totalPages,
  loading,
  onPageChange,
}: {
  tracks: ReturnType<typeof convertLastfmRecentTrack>[];
  page: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (p: number) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
      <h2 className="text-gray-100 font-mono font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4 text-cyan-400" />
        Recent Tracks
        {totalPages > 0 && (
          <span className="text-gray-600 text-xs ml-1">({totalPages} pages)</span>
        )}
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
        </div>
      ) : tracks.length > 0 ? (
        <>
          <div className="space-y-1 mb-6">
            {tracks.map((track, idx) => (
              <div key={`${track.title}-${track.artist}-${page}-${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
                <span className="text-gray-600 font-mono text-xs w-6 text-right shrink-0">
                  {(page - 1) * 50 + idx + 1}
                </span>
                {track.image && (
                  <img src={track.image} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-200 font-mono text-sm truncate">{track.title}</p>
                  <p className="text-gray-500 font-mono text-xs truncate">{track.artist} — {track.album}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {track.loved && <Heart className="h-3 w-3 text-red-400 fill-red-400" />}
                  <span className="text-gray-600 font-mono text-xs">
                    {new Date(track.timestamp).toLocaleString([], {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-800">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 font-mono text-xs hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-3 w-3" />
                Previous
              </button>
              <span className="text-gray-500 font-mono text-xs">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 font-mono text-xs hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-600 font-mono text-sm text-center py-8">No recent tracks found.</p>
      )}
    </div>
  );
}

// --- Top Artists Tab ---
function TopArtistsTab({
  artists,
  loading,
  timeRange,
}: {
  artists: ReturnType<typeof convertLastfmTopArtist>[];
  loading: boolean;
  timeRange: TimeRange;
}) {
  const maxPlays = artists.length > 0 ? Math.max(...artists.map(a => a.plays)) : 1;

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
      <h2 className="text-gray-100 font-mono font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-purple-400" />
        Top Artists
        <span className="text-gray-600 text-xs ml-1">
          ({TOP_RANGES.find(r => r.value === timeRange)?.label})
        </span>
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
        </div>
      ) : artists.length > 0 ? (
        <div className="space-y-2">
          {artists.map((artist, idx) => (
            <div key={`${artist.name}-${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
              <span className="text-gray-600 font-mono text-xs w-6 text-right">{idx + 1}</span>
              {artist.image && (
                <img src={artist.image} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-gray-200 font-mono text-sm truncate">{artist.name}</p>
                <div className="w-full bg-gray-800 rounded-full h-1 mt-1">
                  <div
                    className="bg-purple-500 h-1 rounded-full transition-all"
                    style={{ width: `${(artist.plays / maxPlays) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-gray-500 font-mono text-xs shrink-0 w-16 text-right">
                {artist.plays.toLocaleString()} plays
              </span>
              <a
                href={artist.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-orange-400 transition-colors shrink-0"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 font-mono text-sm text-center py-8">No top artists found for this period.</p>
      )}
    </div>
  );
}

// --- Top Tracks Tab ---
function TopTracksTab({
  tracks,
  loading,
  timeRange,
}: {
  tracks: ReturnType<typeof convertLastfmTopTrack>[];
  loading: boolean;
  timeRange: TimeRange;
}) {
  const maxPlays = tracks.length > 0 ? Math.max(...tracks.map(t => t.plays)) : 1;

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
      <h2 className="text-gray-100 font-mono font-semibold mb-4 flex items-center gap-2">
        <Music className="h-4 w-4 text-green-400" />
        Top Tracks
        <span className="text-gray-600 text-xs ml-1">
          ({TOP_RANGES.find(r => r.value === timeRange)?.label})
        </span>
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
        </div>
      ) : tracks.length > 0 ? (
        <div className="space-y-2">
          {tracks.map((track, idx) => (
            <div key={`${track.title}-${track.artist}-${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
              <span className="text-gray-600 font-mono text-xs w-6 text-right">{idx + 1}</span>
              {track.image && (
                <img src={track.image} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-gray-200 font-mono text-sm truncate">{track.title}</p>
                <p className="text-gray-500 font-mono text-xs truncate">{track.artist}</p>
                <div className="w-full bg-gray-800 rounded-full h-1 mt-1">
                  <div
                    className="bg-green-500 h-1 rounded-full transition-all"
                    style={{ width: `${(track.plays / maxPlays) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-gray-500 font-mono text-xs shrink-0 w-16 text-right">
                {track.plays.toLocaleString()} plays
              </span>
              <a
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-orange-400 transition-colors shrink-0"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 font-mono text-sm text-center py-8">No top tracks found for this period.</p>
      )}
    </div>
  );
}

// --- Shared Components ---
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 relative overflow-hidden">
      <div className={`${color} mb-2`}>{icon}</div>
      <p className={`font-mono text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-gray-500 font-mono text-xs mt-1">{label}</p>
    </div>
  );
}
