import { useEffect, useState, type ReactNode } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { DataProvider } from "../context/DataContext";
import { Landing } from "../pages/Landing";
import { Dashboard } from "../pages/Dashboard";
import { Analytics } from "../pages/Analytics";
import { WrapReports } from "../pages/WrapReports";
import { Export } from "../pages/Export";
import { LiveAnalytics } from "../pages/LiveAnalytics";
import { LastfmDashboard } from "../pages/LastfmDashboard";
import { handleSpotifyCallback } from "../services/spotifyApi";
import { handleLastfmCallback } from "../services/lastfmApi";
import { Loader2, AlertCircle } from "lucide-react";

function SpotifyCallbackHandler({ children }: { children: ReactNode }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('code') && params.has('state')) {
      handleSpotifyCallback().then((success) => {
        if (success) {
          window.location.href = '/live';
        }
      });
    }
  }, []);
  return <>{children}</>;
}

function LastfmCallbackPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error' | 'need_secret'>('processing');
  const [token, setToken] = useState<string | null>(null);
  const [secretInput, setSecretInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const location = useLocation();

  // Step 1: Parse token from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    const questionIdx = hash.indexOf('?');
    let parsedToken: string | null = null;

    if (questionIdx !== -1) {
      const queryString = hash.substring(questionIdx + 1);
      const params = new URLSearchParams(queryString);
      parsedToken = params.get('token');
    }

    if (!parsedToken) {
      setStatus('error');
      setErrorMsg('No token found in URL. Please try connecting again.');
      return;
    }

    setToken(parsedToken);

    // Step 2: Try to exchange token for session
    handleLastfmCallback(parsedToken).then((success) => {
      if (success) {
        setStatus('success');
        setTimeout(() => {
          window.location.hash = '#/lastfm';
        }, 1500);
      } else {
        // Check if the error is due to missing secret
        const secret = localStorage.getItem('lastfm_api_secret');
        if (!secret) {
          setStatus('need_secret');
          setErrorMsg('API Secret is needed to complete authentication.');
        } else {
          setStatus('error');
          setErrorMsg('Authentication failed. Please try again.');
        }
      }
    }).catch((err) => {
      const secret = localStorage.getItem('lastfm_api_secret');
      if (!secret) {
        setStatus('need_secret');
        setErrorMsg('API Secret is needed to complete authentication.');
      } else {
        setStatus('error');
        setErrorMsg(err instanceof Error ? err.message : 'Authentication failed.');
      }
    });
  }, [location]);

  // Step 3: Retry with manually entered secret
  const handleRetryWithSecret = () => {
    if (!secretInput.trim() || !token) return;

    localStorage.setItem('lastfm_api_secret', secretInput.trim());
    setStatus('processing');

    handleLastfmCallback(token).then((success) => {
      if (success) {
        setStatus('success');
        setTimeout(() => {
          window.location.hash = '#/lastfm';
        }, 1500);
      } else {
        setStatus('error');
        setErrorMsg('Authentication failed. Please check your API secret.');
      }
    }).catch((err) => {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed.');
    });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 p-4">
      {status === 'processing' && (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-gray-400 font-mono">Connecting to Last.fm...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
            <span className="text-orange-400 text-lg">✓</span>
          </div>
          <p className="text-orange-400 font-mono">Last.fm connected successfully!</p>
          <p className="text-gray-500 font-mono text-sm">Redirecting...</p>
        </>
      )}

      {status === 'need_secret' && (
        <div className="max-w-md w-full text-center">
          <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-orange-400" />
          </div>
          <h2 className="text-orange-400 font-mono text-xl font-semibold mb-2">API Secret Required</h2>
          <p className="text-gray-400 font-mono text-sm mb-6">
            {errorMsg}
            <br /><br />
            Enter your Last.fm API secret below to complete authentication.
          </p>
          <div className="space-y-4">
            <input
              type="password"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              placeholder="Enter your Last.fm API Secret"
              autoFocus
              className="w-full px-4 py-3 rounded-lg bg-black border border-gray-600 text-gray-100 font-mono text-sm placeholder:text-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-colors"
            />
            <button
              onClick={handleRetryWithSecret}
              className="w-full px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-mono text-base transition-colors cursor-pointer"
            >
              Complete Authentication
            </button>
          </div>
          <p className="text-gray-600 font-mono text-xs mt-4">
            Find your secret at{' '}
            <a href="https://www.last.fm/api/account/create" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
              last.fm/api/account/create
            </a>
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="max-w-md w-full text-center">
          <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">✗</span>
          </div>
          <h2 className="text-red-400 font-mono text-xl font-semibold mb-2">Connection Failed</h2>
          <p className="text-gray-400 font-mono text-sm mb-6">{errorMsg}</p>
          <div className="space-y-3">
            <a
              href="#/lastfm"
              className="block w-full px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-mono text-base transition-colors"
            >
              Try Again
            </a>
            <a
              href="#/"
              className="block w-full px-6 py-3 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 font-mono text-sm hover:text-gray-200 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <SpotifyCallbackHandler>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/live" element={<LiveAnalytics />} />
            <Route path="/lastfm" element={<LastfmDashboard />} />
            <Route path="/lastfm-callback" element={<LastfmCallbackPage />} />
            <Route path="/wraps" element={<WrapReports />} />
            <Route path="/export" element={<Export />} />
          </Routes>
        </HashRouter>
      </SpotifyCallbackHandler>
    </DataProvider>
  );
}
