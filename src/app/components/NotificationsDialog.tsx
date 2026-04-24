import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Bell, Music, TrendingUp, Heart, Users, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
  const notifications = [
    {
      id: 1,
      icon: Music,
      title: 'New Release Alert',
      description: 'The Weeknd released a new album "Dawn FM"',
      time: '2 hours ago',
      color: 'from-purple-500 to-pink-500',
      read: false,
    },
    {
      id: 2,
      icon: TrendingUp,
      title: 'Weekly Report Ready',
      description: 'Your weekly listening stats are now available',
      time: '5 hours ago',
      color: 'from-blue-500 to-cyan-500',
      read: false,
    },
    {
      id: 3,
      icon: Heart,
      title: 'Top Track Milestone',
      description: 'You\'ve listened to "Blinding Lights" 200 times!',
      time: '1 day ago',
      color: 'from-red-500 to-pink-500',
      read: true,
    },
    {
      id: 4,
      icon: Users,
      title: 'Similar Listeners',
      description: '5 people with similar taste started following you',
      time: '2 days ago',
      color: 'from-green-500 to-emerald-500',
      read: true,
    },
    {
      id: 5,
      icon: Music,
      title: 'Playlist Update',
      description: 'Your Discover Weekly playlist has been updated',
      time: '3 days ago',
      color: 'from-yellow-500 to-orange-500',
      read: true,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-950 light:from-white light:to-gray-50 border-gray-800 light:border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-white light:text-gray-900">
            <div className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 light:from-blue-500/10 light:to-cyan-500/10">
                <Bell className="h-6 w-6 text-blue-400 light:text-blue-600" />
              </div>
              Notifications
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-400 hover:text-purple-300 light:text-purple-600 light:hover:text-purple-700"
            >
              Mark all as read
            </Button>
          </DialogTitle>
          <DialogDescription className="light:text-gray-600">
            Stay updated with your music activity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-6">
          {notifications.map((notification, index) => {
            const Icon = notification.icon;
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                <div
                  className={`p-4 rounded-xl transition-all border cursor-pointer ${
                    notification.read
                      ? 'bg-gray-800/30 light:bg-white border-gray-800 light:border-gray-200 hover:bg-gray-800/50 light:hover:bg-gray-50'
                      : 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 light:from-purple-100/50 light:to-pink-100/50 border-purple-500/30 light:border-purple-300 hover:border-purple-500/50 light:hover:border-purple-400'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${notification.color} bg-opacity-10 light:bg-opacity-5 flex-shrink-0`}>
                      <Icon className="h-5 w-5 text-white light:text-gray-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-white light:text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-purple-500 flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 light:text-gray-600 mb-2">
                        {notification.description}
                      </p>
                      <p className="text-xs text-gray-600 light:text-gray-500">
                        {notification.time}
                      </p>
                    </div>
                    {notification.read && (
                      <Check className="h-4 w-4 text-green-500 light:text-green-600 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800 light:border-gray-200">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}