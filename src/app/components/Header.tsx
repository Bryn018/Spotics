import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Download, Home, LogOut } from 'lucide-react';
import { SpoticsLogo } from './SpoticsLogo';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import { useSession } from '../context/SessionContext';
import { apiBaseUrl, apiRoutes } from '../lib/api';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/dashboard/export', label: 'Export', icon: Download },
];

export function Header() {
  const location = useLocation();
  const { user } = useSession();

  const handleLogout = () => {
    window.location.href = `${apiBaseUrl}${apiRoutes.logout}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-black/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 lg:px-6 max-w-[1600px]">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <SpoticsLogo className="h-8 w-8 transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              Spotics
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gray-800/80 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-3">
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name || 'User'}
                    className="h-8 w-8 rounded-full border border-gray-700"
                  />
                )}
                <span className="hidden sm:block text-sm text-gray-300">
                  {user.display_name || user.email}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        <nav className="flex md:hidden items-center gap-1 pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gray-800/80 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
