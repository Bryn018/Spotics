import { useEffect, type ReactNode } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "../context/DataContext";
import { Landing } from "../pages/Landing";
import { Dashboard } from "../pages/Dashboard";
import { Analytics } from "../pages/Analytics";
import { WrapReports } from "../pages/WrapReports";
import { Export } from "../pages/Export";
import { LiveAnalytics } from "../pages/LiveAnalytics";
import { handleSpotifyCallback } from "../services/spotifyApi";

function SpotifyCallbackHandler({ children }: { children: ReactNode }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('code') && params.has('state')) {
      handleSpotifyCallback().then((success) => {
        if (success) {
          // Redirect to Live Analytics page after successful auth
          window.location.href = '/live';
        }
      });
    }
  }, []);
  return <>{children}</>;
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
            <Route path="/wraps" element={<WrapReports />} />
            <Route path="/export" element={<Export />} />
          </Routes>
        </HashRouter>
      </SpotifyCallbackHandler>
    </DataProvider>
  );
}
