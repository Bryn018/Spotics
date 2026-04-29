import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User, Mail, Calendar, Music, TrendingUp, LogOut, Edit, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Plays', value: '2,847', icon: Music, color: 'from-purple-500 to-pink-500' },
    { label: 'Artists', value: '312', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
    { label: 'Hours Listened', value: '486', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
  ];

  const handleLogout = () => {
    onOpenChange(false);
    navigate('/login');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-gray-900 to-gray-950 light:from-white light:to-gray-50 border-gray-800 light:border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl text-white light:text-gray-900">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 light:from-purple-500/10 light:to-pink-500/10">
              <User className="h-6 w-6 text-purple-400 light:text-purple-600" />
            </div>
            Account
          </DialogTitle>
          <DialogDescription className="light:text-gray-600">
            Manage your profile and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {/* Profile Section */}
          <div className="flex items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 light:from-purple-100/30 light:to-pink-100/30 border border-purple-500/30 light:border-purple-300 mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-purple-500/30 light:ring-purple-400/40">
                <AvatarImage src="https://images.unsplash.com/photo-1541293590517-e76751af59f1?w=200" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
              >
                <Edit className="h-3 w-3" />
              </motion.button>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white light:text-gray-900 mb-1">Music Enthusiast</h3>
              <p className="text-gray-400 light:text-gray-600 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                music.lover@spotics.com
              </p>
              <p className="text-gray-500 light:text-gray-500 text-sm flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4" />
                Member since Jan 2024
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="p-4 rounded-xl bg-gray-800/50 light:bg-white border border-gray-700 light:border-gray-200 text-center"
                >
                  <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10 light:bg-opacity-5 mb-2`}>
                    <Icon className="h-4 w-4 text-white light:text-gray-900" />
                  </div>
                  <p className="text-2xl font-bold text-white light:text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400 light:text-gray-600 mt-1">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 mb-6">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start gap-3 bg-red-900/20 light:bg-red-50 border-red-500/30 light:border-red-200 hover:bg-red-900/30 light:hover:bg-red-100 hover:border-red-500/50 text-red-400 light:text-red-600 h-12"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}