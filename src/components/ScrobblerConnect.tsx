import { useState } from 'react';
import { Link2, Key, CheckCircle, AlertCircle, Loader2, ExternalLink, ChevronRight, Music2, Puzzle } from 'lucide-react';
import { hasApiKey, registerApiKey, checkHealth } from '../services/scrobbleApi';

interface ScrobblerConnectProps {
  onConnected?: () => void;
}

export function ScrobblerConnect({ onConnected }: ScrobblerConnectProps) {
  const [apiKey, setApiKey] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(hasApiKey());
  const [serverHealthy, setServerHealthy] = useState<boolean | null>(null);

  // Check server health on mount
  useState(() => {
    checkHealth().then(setServerHealthy);
  });

  const handleRegister = async () => {
    setIsRegistering(true);
    setError(null);
    try {
      const key = await registerApiKey();
      localStorage.setItem('spotics_api_key', key);
      setApiKey(key);
      setIsConnected(true);
      onConnected?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }
    if (!apiKey.startsWith('spotics_')) {
      setError('Invalid API key format. Keys start with "spotics_"');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Validate by making a test request
      const response = await fetch('https://api.spotics.insights.autos/stats?period=all', {
        headers: { 'X-API-Key': apiKey.trim() },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid API key');
      }

      localStorage.setItem('spotics_api_key', apiKey.trim());
      setIsConnected(true);
      onConnected?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('spotics_api_key');
    setIsConnected(false);
    setApiKey('');
  };

  if (isConnected) {
    return (
      <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="h-6 w-6 text-green-400" />
          <div>
            <h3 className="text-green-400 font-mono font-semibold text-lg">Scrobbler Connected</h3>
            <p className="text-gray-400 font-mono text-sm">Your listening history is being tracked</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDisconnect}
            className="text-sm font-mono text-gray-500 hover:text-red-400 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Server Status */}
      {serverHealthy !== null && (
        <div className={`flex items-center gap-2 font-mono text-xs ${serverHealthy ? 'text-green-400' : 'text-yellow-400'}`}>
          <span className={`w-2 h-2 rounded-full ${serverHealthy ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
          Server: {serverHealthy ? 'Online' : 'Unreachable'}
        </div>
      )}

      {/* Step 1: Install Extension */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Puzzle className="h-5 w-5 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-100 font-mono font-semibold mb-1">
              Step 1: Install the Browser Extension
            </h3>
            <p className="text-gray-400 font-mono text-sm mb-4">
              The Spotics Scrobbler extension tracks what you play on Spotify Web Player and sends it to your dashboard.
            </p>
            <div className="bg-black/50 rounded-lg p-4 border border-gray-800 mb-4">
              <p className="text-gray-300 font-mono text-sm mb-2">Load the extension in Chrome:</p>
              <ol className="space-y-2 text-gray-400 font-mono text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 shrink-0">01.</span>
                  <span>Go to <code className="text-green-400">chrome://extensions</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 shrink-0">02.</span>
                  <span>Enable "Developer mode" (top right toggle)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 shrink-0">03.</span>
                  <span>Click "Load unpacked" and select the <code className="text-green-400">extension/</code> folder</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 shrink-0">04.</span>
                  <span>Pin the extension to your toolbar</span>
                </li>
              </ol>
            </div>
            <p className="text-gray-500 font-mono text-xs">
              The extension reads the Spotify Web Player DOM — no private API access, no ToS violations.
            </p>
          </div>
        </div>
      </div>

      {/* Step 2: Get API Key */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Key className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-100 font-mono font-semibold mb-1">
              Step 2: Get Your API Key
            </h3>
            <p className="text-gray-400 font-mono text-sm mb-4">
              Create a free Spotics account to get an API key for the scrobbler.
            </p>

            <button
              onClick={handleRegister}
              disabled={isRegistering}
              className="btn-register flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-sm hover:bg-blue-500/20 transition-colors disabled:opacity-50"
            >
              {isRegistering ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Key className="h-4 w-4" />
              )}
              {isRegistering ? 'Creating...' : 'Generate API Key'}
            </button>
          </div>
        </div>
      </div>

      {/* Step 3: Connect */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Link2 className="h-5 w-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-100 font-mono font-semibold mb-1">
              Step 3: Connect
            </h3>
            <p className="text-gray-400 font-mono text-sm mb-4">
              Paste your API key to connect the scrobbler to your dashboard.
            </p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="spotics_live_..."
                  className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-gray-700 text-gray-100 font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:border-green-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                />
                <button
                  onClick={handleConnect}
                  disabled={isConnecting || !apiKey.trim()}
                  className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-sm hover:bg-green-500/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                  Connect
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400 font-mono text-xs">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-6">
        <h3 className="text-gray-300 font-mono font-semibold mb-4 flex items-center gap-2">
          <Music2 className="h-4 w-4 text-green-400" />
          How It Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-green-400 font-mono text-sm font-bold">1</span>
            </div>
            <p className="text-gray-400 font-mono text-xs">Play music on Spotify Web Player</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-400 font-mono text-sm font-bold">2</span>
            </div>
            <p className="text-gray-400 font-mono text-xs">Extension detects the track via DOM</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-400 font-mono text-sm font-bold">3</span>
            </div>
            <p className="text-gray-400 font-mono text-xs">Data sent to your Spotics dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
