import { Link, useLocation } from 'react-router-dom';
import { SpoticsLogo } from './SpoticsLogo';

export function Header() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#111827] bg-black/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-[1600px]">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-3">
            <SpoticsLogo className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-[#1DB954]">
              Spotics
            </h1>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/dashboard" 
              className={`text-sm font-medium transition-colors ${
                isActive('/dashboard') ? 'text-[#1DB954]' : 'text-gray-400 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/dashboard/analytics" 
              className={`text-sm font-medium transition-colors ${
                isActive('/dashboard/analytics') ? 'text-[#3B82F6]' : 'text-gray-400 hover:text-white'
              }`}
            >
              Analytics
            </Link>
            <Link 
              to="/dashboard/export" 
              className={`text-sm font-medium transition-colors ${
                isActive('/dashboard/export') ? 'text-[#D81E5B]' : 'text-gray-400 hover:text-white'
              }`}
            >
              Export
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
