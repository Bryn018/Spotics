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
import { Loader2 } from "lucide-react";

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
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const location = useLocation();

  useEffect(() => {
    // With HashRouter, the URL looks like: https://site.com/#/lastfm-callback?token=XXXXX
    const hash = window.location.hash; // e.g., "#/lastfm-callback?token=XXXXX"

    let token: string | null = null;

    // Parse token from hash
    const questionIdx = hash.indexOf('?');
    if (questionIdx !== -1) {
      const queryString = hash.substring(questionIdx + 1);
      const params = new URLSearchParams(queryString);
      token = params.get('token');
    }

    if (!token) {
      setStatus('error');
      return;
    }

    handleLastfmCallback(token).then((success) => {
      if (success) {
        setStatus('success');
        setTimeout(() => {
          window.location.hash = '#/lastfm';
        }, 1500);
      } else {
        setStatus('error');
      }
    });
  }, [location]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
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
      {status === 'error' && (
        <>
          <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-red-400 text-lg">✗</span>
          </div>
          <p className="text-red-400 font-mono">Last.fm connection failed.</p>
          <a href="#/" className="text-gray-400 font-mono text-sm hover:underline">Go back</a>
        </>
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
