import { Music2, Bell, Settings, User, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetHeader } from './ui/sheet';
import { SpoticsLogo } from './SpoticsLogo';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { SettingsDialog } from './SettingsDialog';
import { NotificationsDialog } from './NotificationsDialog';
import { AccountDialog } from './AccountDialog';
import { motion } from 'framer-motion';

export function Header() {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-3">
              <SpoticsLogo className="h-10 w-10" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                Spotics
              </h1>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/dashboard" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/dashboard') ? 'text-green-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/dashboard/analytics" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/dashboard/analytics') ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                Analytics
              </Link>
              <Link 
                to="/dashboard/export" 
                className={`text-sm font-medium transition-colors ${
                  isActive('/dashboard/export') ? 'text-rose-800' : 'text-gray-400 hover:text-white'
                }`}
              >
                Export
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-white hidden sm:flex relative"
                onClick={() => setNotificationsOpen(true)}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-purple-500"></span>
              </Button>
            </motion.div>
            
            {/* Settings */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-white hidden sm:flex"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </motion.div>
            
            {/* Account Avatar */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Avatar 
                className="h-9 w-9 hidden sm:flex cursor-pointer ring-2 ring-transparent hover:ring-purple-500/50 transition-all" 
                onClick={() => setAccountOpen(true)}
              >
                <AvatarImage src="https://images.unsplash.com/photo-1541293590517-e76751af59f1?w=100" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
            </motion.div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-gray-900 border-gray-800">
                <SheetHeader>
                  <SheetTitle className="text-white">Menu</SheetTitle>
                  <SheetDescription>Choose a section to navigate to</SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  <Link 
                    to="/dashboard" 
                    className={`text-sm font-medium py-2 transition-colors ${
                      isActive('/dashboard') ? 'text-green-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/dashboard/analytics" 
                    className={`text-sm font-medium py-2 transition-colors ${
                      isActive('/dashboard/analytics') ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Analytics
                  </Link>
                  <Link 
                    to="/dashboard/export" 
                    className={`text-sm font-medium py-2 transition-colors ${
                      isActive('/dashboard/export') ? 'text-rose-800' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Export
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Dialogs */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <NotificationsDialog open={notificationsOpen} onOpenChange={setNotificationsOpen} />
      <AccountDialog open={accountOpen} onOpenChange={setAccountOpen} />
    </>
  );
}