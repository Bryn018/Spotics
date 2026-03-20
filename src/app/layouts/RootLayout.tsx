import { Navigate, Outlet, useLocation } from 'react-router';
import { Header } from '../components/Header';
import { useSession } from '../context/SessionContext';
import { DashboardProvider } from '../context/DashboardContext';
import { ThemeProvider } from '../context/ThemeContext';

export function RootLayout() {
  const location = useLocation();
  const { authenticated } = useSession();

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <ThemeProvider>
      <DashboardProvider>
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
          <Header />
          <Outlet />
          <footer className="relative border-t border-gray-800/50 bg-gradient-to-b from-transparent to-black/50 backdrop-blur-sm mt-20 py-12">
            <div className="container mx-auto px-4 max-w-[1600px]">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                  <p className="text-gray-400 text-sm">© 2026 Spotics. Track your Spotify listening habits.</p>
                  <div className="h-px w-12 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                </div>
                <p className="text-gray-500 text-xs">Made with ♥ for music lovers</p>
              </div>
            </div>
          </footer>
        </div>
      </DashboardProvider>
    </ThemeProvider>
  );
}
