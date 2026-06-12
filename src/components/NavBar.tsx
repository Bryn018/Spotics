import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { isLastfmConnected, getLastfmUsername } from '../services/lastfmApi';
import { Terminal, BarChart3, Home, Download, ScrollText, Activity, Radio } from 'lucide-react';

interface NavBarProps {
  currentPage: 'dashboard' | 'analytics' | 'wraps' | 'export' | 'live' | 'lastfm';
}

export function NavBar({ currentPage }: NavBarProps) {
  const navigate = useNavigate();
  const { data } = useData();

  const lfmConnected = isLastfmConnected();
  const lfmUsername = getLastfmUsername();

  if (!data && !lfmConnected) return null;

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { id: 'live' as const, label: 'Live', icon: Activity, path: '/live' },
    { id: 'lastfm' as const, label: 'Last.fm', icon: Radio, path: '/lastfm' },
    { id: 'wraps' as const, label: 'Wraps', icon: ScrollText, path: '/wraps' },
    { id: 'export' as const, label: 'Export', icon: Download, path: '/export' },
  ];

  return (
    <nav className="border-b border-gray-800/50 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-6 max-w-[1600px]">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Terminal className="h-5 w-5 text-green-500" />
            <span className="font-mono font-bold text-green-400 text-lg">spotics</span>
          </button>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md font-mono text-sm transition-colors
                    ${active
                      ? item.id === 'lastfm'
                        ? 'text-orange-400 bg-orange-500/10'
                        : 'text-green-400 bg-green-500/10'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Data indicator */}
          <div className="flex items-center gap-3 text-gray-500 font-mono text-xs">
            {lfmConnected && (
              <div className="flex items-center gap-1.5 text-orange-400/70">
                <Radio className="h-3 w-3" />
                <span className="hidden md:inline">{lfmUsername}</span>
              </div>
            )}
            {data && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="hidden md:inline">{data.totalTracks.toLocaleString()} tracks</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
