import { useState } from 'react';
import { Bell, Settings, Search, Menu, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetHeader } from './ui/sheet';
import { SpoticsLogo } from './SpoticsLogo';
import { Link, useLocation } from 'react-router';
import { useSession } from '../context/SessionContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiRoutes } from '../lib/api';
import { ThemeToggle } from './ThemeToggle';
import { NotificationsDialog } from './NotificationsDialog';
import { SettingsDialog } from './SettingsDialog';
import { AccountDialog } from './AccountDialog';

export function Header() {
  const location = useLocation();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post(apiRoutes.logout);
    },
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ['dashboard'], exact: false });
      await queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });

  const isActive = (path: string) => location.pathname === path;

  const initials = user?.display_name?.slice(0, 2).toUpperCase() ?? user?.email?.slice(0, 2).toUpperCase() ?? 'SP';

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-3">
              <SpoticsLogo className="h-10 w-10" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Spotics
              </h1>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  isActive('/dashboard') ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/dashboard/analytics"
                className={`text-sm font-medium transition-colors ${
                  isActive('/dashboard/analytics') ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Analytics
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search tracks, artists..." className="pl-10 bg-gray-900/50 border-gray-800 focus:border-purple-500" />
            </div>

            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hidden sm:flex"
              onClick={() => setNotificationsOpen(true)}
            >
              <Bell className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hidden sm:flex"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>

            <button
              className="hidden sm:flex items-center gap-3 border border-gray-800 rounded-full pl-2 pr-3 py-1 bg-gray-900/50 hover:border-purple-500/50 transition"
              onClick={() => setAccountOpen(true)}
            >
              <Avatar className="h-8 w-8">
                {user?.avatar_url ? (
                  <AvatarImage src={user.avatar_url} alt={user.display_name ?? user.email ?? 'Spotics user'} />
                ) : (
                  <AvatarFallback>{initials}</AvatarFallback>
                )}
              </Avatar>
              <div className="text-left leading-tight">
                <p className="text-sm text-white font-medium truncate max-w-[120px]">
                  {user?.display_name ?? user?.email ?? 'Listener'}
                </p>
                <p className="text-xs text-gray-500">Tap for account</p>
              </div>
            </button>

            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hidden sm:flex"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-gray-900 border-gray-800">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>Choose a section to navigate to</SheetDescription>
                </SheetHeader>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {user?.avatar_url ? (
                      <AvatarImage src={user.avatar_url} alt={user?.display_name ?? 'Spotics user'} />
                    ) : (
                      <AvatarFallback>{initials}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-white font-medium leading-tight">{user?.display_name ?? 'Spotics listener'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    Sign out
                  </Button>
                </div>
                <nav className="flex flex-col gap-4 mt-8">
                  <Link
                    to="/dashboard"
                    className={`text-sm font-medium py-2 transition-colors ${
                      isActive('/dashboard') ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/dashboard/analytics"
                    className={`text-sm font-medium py-2 transition-colors ${
                      isActive('/dashboard/analytics') ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Analytics
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <NotificationsDialog open={notificationsOpen} onOpenChange={setNotificationsOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AccountDialog open={accountOpen} onOpenChange={setAccountOpen} />
    </>
  );
}
