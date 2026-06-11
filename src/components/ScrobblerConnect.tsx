import { useState, useEffect } from 'react';
import {
  Link2,
  Key,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Eye,
  EyeOff,
  Music2,
  Puzzle,
  ExternalLink,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import {
  hasApiKey,
  registerApiKey,
  checkHealth,
  revokeApiKey,
} from '../services/scrobbleApi';

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
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [existingKey, setExistingKey] = useState<string | null>(null);

  useEffect(() => {
    checkHealth().then(setServerHealthy);
    const key = localStorage.getItem('spotics_api_key');
    if (key) {
      setExistingKey(key);
      setIsConnected(true);
    }

    const handleKeySynced = (e: Event) => {
      const custom = e as CustomEvent<string>;
      const syncedKey = custom.detail;
      setExistingKey(syncedKey);
      setApiKey(syncedKey);
      setIsConnected(true);
    };

    window.addEventListener('spotics-key-synced', handleKeySynced as EventListener);

    const pollInterval = setInterval(() => {
      const currentKey = localStorage.getItem('spotics_api_key');
      if (currentKey && currentKey !== existingKey) {
        setExistingKey(currentKey);
        setApiKey(currentKey);
        setIsConnected(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener('spotics-key-synced', handleKeySynced as EventListener);
      clearInterval(pollInterval);
    };
  }, [existingKey]);

  const handleRegister = async () => {
    setIsRegistering(true);
    setError(null);
    try {
      const key = await registerApiKey();
      localStorage.setItem('spotics_api_key', key);
      setExistingKey(key);
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
      setError('Please enter your API key');
      return;
    }
    if (!apiKey.startsWith('spotics_')) {
      setError('Invalid API key format. Keys start with "spotics_"');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch('https://api.spotics.insights.autos/stats?period=all', {
        headers: { 'X-API-Key': apiKey.trim() },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid API key');
      }

      localStorage.setItem('spotics_api_key', apiKey.trim());
      setExistingKey(apiKey.trim());
      setIsConnected(true);
      onConnected?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  };

  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevoke = async () => {
    setIsRevoking(true);
    setError(null);
    try {
      await revokeApiKey();
      setApiKey('');
      setExistingKey(null);
      setIsConnected(false);
      setShowKey(false);
      setCopied(false);
      setShowRevokeConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke key');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('spotics_api_key');
    setIsConnected(false);
    setApiKey('');
    setExistingKey(null);
    setShowKey(false);
    setCopied(false);
  };

  const handleCopyKey = async () => {
    const key = existingKey || apiKey;
    if (key) {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 12) return key;
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
  };

  if (isConnected && existingKey) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-400" />
            <div>
              <h3 className="text-green-400 font-mono font-semibold text-lg">Scrobbler Connected</h3>
              <p className="text-gray-400 font-mono text-sm">Your listening history is being tracked</p>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-black/50 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 font-mono text-xs">Your API Key</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 text-xs">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="font-mono text-sm text-gray-200 break-all bg-black/30 rounded p-2 border border-gray-700">
              {showKey ? existingKey : maskKey(existingKey)}
            </div>
            <p className="text-gray-500 font-mono text-xs mt-2">
              Use this key to connect the browser extension or other clients.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              type="button"
              onClick={() => setShowRevokeConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-sm hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Revoke Key
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  setError(null);
                  await handleRevoke();
                  const freshKey = await registerApiKey();
                  localStorage.setItem('spotics_api_key', freshKey);
                  setExistingKey(freshKey);
                  setApiKey(freshKey);
                  setIsConnected(true);
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to regenerate key');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono text-sm hover:bg-yellow-500/20 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate Key
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
              className="text-sm font-mono text-gray-500 hover:text-red-400 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Revoke Confirmation Modal */}
        {showRevokeConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 border border-red-500/30 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <Trash2 className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-red-400 font-mono font-semibold text-lg">Revoke API Key</h3>
                  <p className="text-gray-400 font-mono text-xs">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-300 font-mono text-sm mb-6">
                Your API key will be permanently deactivated. Any connected extensions or clients will immediately stop working. You can generate a new key afterward.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRevokeConfirm(false)}
                  disabled={isRevoking}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 font-mono text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRevoke}
                  disabled={isRevoking}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 font-mono text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  {isRevoking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Revoking...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Yes, Revoke
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {serverHealthy !== null && (
        <div
          className={`flex items-center gap-2 font-mono text-xs ${
            serverHealthy ? 'text-green-400' : 'text-yellow-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${serverHealthy ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
          Server: {serverHealthy ? 'Online' : 'Unreachable'}
        </div>
      )}

      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Key className="h-5 w-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-100 font-mono font-semibold mb-1">Step 1: Generate Your API Key</h3>
            <p className="text-gray-400 font-mono text-sm mb-4">Create your Spotics identity. This key links the extension to your dashboard.</p>
            <button
              type="button"
              onClick={handleRegister}
              disabled={isRegistering}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-sm hover:bg-blue-500/20 transition-colors disabled:opacity-50"
            >
              {isRegistering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
              {isRegistering ? 'Creating...' : 'Generate API Key'}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Puzzle className="h-5 w-5 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-100 font-mono font-semibold mb-1">Step 2: Install the Browser Extension</h3>
            <p className="text-gray-400 font-mono text-sm mb-4">The extension tracks what you play on Spotify Web Player.</p>
            <div className="bg-black/50 rounded-lg p-4 border border-gray-800 mb-4">
              <ol className="space-y-2 text-gray-400 font-mono text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 shrink-0">01.</span>
                  <span>
                    Go to <code className="text-green-400">brave://extensions</code> (or <code className="text-green-400">chrome://extensions</code>)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 shrink-0">02.</span>
                  <span>Enable "Developer mode" (top right toggle)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 shrink-0">03.</span>
                  <span>Click "Load unpacked" → select the extension folder</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 shrink-0">04.</span>
                  <span>Pin the extension to your toolbar</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Link2 className="h-5 w-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-100 font-mono font-semibold mb-1">Step 3: Connect the Extension</h3>
            <p className="text-gray-400 font-mono text-sm mb-4">Paste your API key to link the extension to your dashboard.</p>

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
                  type="button"
                  onClick={handleConnect}
                  disabled={isConnecting || !apiKey.trim()}
                  className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-sm hover:bg-green-500/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
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
            <p className="text-gray-400 font-mono text-xs">Generate your API key here</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-400 font-mono text-sm font-bold">2</span>
            </div>
            <p className="text-gray-400 font-mono text-xs">Install extension & paste the key</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-400 font-mono text-sm font-bold">3</span>
            </div>
            <p className="text-gray-400 font-mono text-xs">Play music — analytics appear live</p>
          </div>
        </div>
      </div>
    </div>
  );
}
