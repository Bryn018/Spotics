import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Settings, Trash2, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDeleteAccount = () => {
    // TODO: Hook into real account deletion once backend supports it.
    setConfirmingDelete(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl text-white">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Settings className="h-6 w-6 text-purple-400" />
            </div>
            Settings
          </DialogTitle>
          <DialogDescription>Manage your Spotics account preferences</DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <User className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Manage Account</h3>
                <p className="text-sm text-gray-400">Control your account settings and data</p>
              </div>
            </div>

            {!confirmingDelete ? (
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  onClick={() => setConfirmingDelete(true)}
                  variant="outline"
                  className="w-full justify-start gap-3 bg-red-900/20 border-red-500/30 hover:bg-red-900/30 hover:border-red-500/50 text-red-400 h-12 mt-4"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Spotics Account
                </Button>
              </motion.div>
            ) : (
              <div className="mt-4 p-4 rounded-xl bg-red-900/20 border border-red-500/30">
                <div className="flex items-start gap-3 mb-4">
                  <Trash2 className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-400 mb-1">Delete your account?</h4>
                    <p className="text-sm text-red-300">
                      This action is permanent and cannot be undone. All listening data and stats will be erased.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setConfirmingDelete(false)}
                    variant="outline"
                    className="flex-1 bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleDeleteAccount} className="flex-1 bg-red-500 hover:bg-red-600">
                    Delete Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Spotics version 2.0.0</p>
            <p className="text-xs text-gray-600 mt-1">Last updated: March 19, 2026</p>
          </div>
          <Button onClick={() => onOpenChange(false)} className="bg-gradient-to-r from-purple-500 to-pink-500">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
