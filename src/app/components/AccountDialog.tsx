import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Calendar, LogOut, Mail, Shield, TrendingUp, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useDashboardData } from '../context/DashboardContext';
import { useSession } from '../context/SessionContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiRoutes } from '../lib/api';

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const { data } = useDashboardData();
  const { user } = useSession();
  const queryClient = useQueryClient();

  const totals = data?.summary?.totals;
  const statsPayload = data?.summary?.payload?.stats;

  const stats = [
    {
      label: 'Total Plays',
      value: (totals?.tracks ?? 0).toLocaleString(),
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Artists',
      value: (totals?.artists ?? 0).toLocaleString(),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Hours Listened',
      value: formatHours(statsPayload?.totalMinutes ?? 0),
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post(apiRoutes.logout);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.removeQueries({ queryKey: ['dashboard'], exact: false });
      onOpenChange(false);
    },
  });

  const initials = user?.display_name?.slice(0, 2).toUpperCase() ?? user?.email?.slice(0, 2).toUpperCase() ?? 'SP';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-gray-900 to-gray-950 light:from-white light:to-gray-50 border-gray-800 light:border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl text-white light:text-gray-900">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 light:from-purple-500/10 light:to-pink-500/10">
              <UserIcon className="h-6 w-6 text-purple-400 light:text-purple-600" />
            </div>
            Account
          </DialogTitle>
          <DialogDescription className="light:text-gray-600">Manage your profile and preferences</DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <div className="flex items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 light:from-purple-100/30 light:to-pink-100/30 border border-purple-500/30 light:border-purple-300 mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-purple-500/30 light:ring-purple-400/40 cursor-pointer">
                {user?.avatar_url ? (
                  <AvatarImage src={user.avatar_url} alt={user.display_name ?? user.email ?? 'Spotics user'} />
                ) : (
                  <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
                )}
              </Avatar>
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
              >
                Connected
              </motion.span>
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white light:text-gray-900 mb-1">
                {user?.display_name ?? 'Spotics listener'}
              </h3>
              <p className="text-gray-400 light:text-gray-600 flex items-center gap-2 truncate">
                <Mail className="h-4 w-4" />
                {user?.email ?? 'Not provided'}
              </p>
              <p className="text-gray-500 light:text-gray-500 text-sm flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4" />
                Joined {formatDate(user?.created_at)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="p-4 rounded-xl bg-gray-800/50 light:bg-white border border-gray-700 light:border-gray-200 text-center"
              >
                <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10 light:bg-opacity-5 mb-2`}>
                  <TrendingUp className="h-4 w-4 text-white light:text-gray-900" />
                </div>
                <p className="text-2xl font-bold text-white light:text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 light:text-gray-600 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-800/60 light:border-gray-200 bg-gray-900/30 light:bg-white">
              <Shield className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm font-semibold text-white light:text-gray-900">Protected account</p>
                <p className="text-xs text-gray-500">We never store your Spotify password.</p>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                variant="outline"
                onClick={() => logoutMutation.mutate()}
                className="w-full justify-start gap-3 bg-red-900/20 light:bg-red-50 border-red-500/30 light:border-red-200 hover:bg-red-900/30 light:hover:bg-red-100 hover:border-red-500/50 text-red-400 light:text-red-600 h-12"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4" />
                {logoutMutation.isPending ? 'Signing out…' : 'Logout'}
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatHours(minutes: number) {
  const hours = Math.floor(minutes / 60);
  return `${hours.toLocaleString()}h`;
}

function formatDate(date?: string) {
  if (!date) return 'recently';
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(date));
}
