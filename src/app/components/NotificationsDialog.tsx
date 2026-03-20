import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Bell, Check, Heart, Music, TrendingUp, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useDashboardData } from '../context/DashboardContext';

interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const iconMap = {
  release: Music,
  report: TrendingUp,
  milestone: Heart,
  social: Users,
} as const;

export function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
  const { data } = useDashboardData();

  const defaultNotifications = [
    {
      id: 'release',
      icon: 'release' as const,
      title: 'New Release Alert',
      description: 'The Weeknd just dropped a new single. Tune in now.',
      time: '2 hours ago',
      color: 'from-purple-500 to-pink-500',
      read: false,
    },
    {
      id: 'report',
      icon: 'report' as const,
      title: 'Weekly Report Ready',
      description: 'Your weekly listening stats are now available.',
      time: '5 hours ago',
      color: 'from-blue-500 to-cyan-500',
      read: false,
    },
    {
      id: 'milestone',
      icon: 'milestone' as const,
      title: 'Top Track Milestone',
      description: 'You just crossed 200 plays on your #1 song!',
      time: '1 day ago',
      color: 'from-red-500 to-pink-500',
      read: true,
    },
    {
      id: 'social',
      icon: 'social' as const,
      title: 'Similar Listeners',
      description: '5 people with similar taste started following you.',
      time: '2 days ago',
      color: 'from-green-500 to-emerald-500',
      read: true,
    },
  ];

  const notifications = data?.activities?.slice(0, 4).map((activity, index) => ({
    id: activity.id,
    icon: index === 0 ? 'release' : index === 1 ? 'report' : index === 2 ? 'milestone' : 'social',
    title: activity.title,
    description: activity.subtitle ?? 'Recent Spotify activity',
    time: new Date(activity.occurred_at).toLocaleString(),
    color: defaultNotifications[index]?.color ?? 'from-purple-500 to-pink-500',
    read: index > 1,
  })) ?? defaultNotifications;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <Bell className="h-6 w-6 text-blue-400" />
              </div>
              Notifications
            </div>
            <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
              Mark all as read
            </Button>
          </DialogTitle>
          <DialogDescription>Stay updated with your music activity</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-6">
          {notifications.map((notification, index) => {
            const Icon = iconMap[notification.icon] ?? Music;
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
                      ? 'bg-gray-800/30 border-gray-800 hover:bg-gray-800/50'
                      : 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${notification.color} bg-opacity-10 flex-shrink-0`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-white">{notification.title}</h3>
                        {!notification.read && <div className="h-2 w-2 rounded-full bg-purple-500 flex-shrink-0 mt-2" />}
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{notification.description}</p>
                      <p className="text-xs text-gray-600">{notification.time}</p>
                    </div>
                    {notification.read && <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800">
          <Button onClick={() => onOpenChange(false)} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
