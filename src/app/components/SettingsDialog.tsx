import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Settings, User, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = () => {
    // Handle account deletion logic here
    alert('Account deletion requested. This feature will be implemented.');
    setShowDeleteConfirm(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-900 to-gray-950 light:from-white light:to-gray-50 border-gray-800 light:border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl text-white light:text-gray-900">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 light:from-purple-500/10 light:to-pink-500/10">
              <Settings className="h-6 w-6 text-purple-400 light:text-purple-600" />
            </div>
            Settings
          </DialogTitle>
          <DialogDescription className="light:text-gray-600">
            Manage your Spotics account settings
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {/* Manage Account Section */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 light:from-white light:to-gray-50 border border-gray-700 light:border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 light:from-purple-500/10 light:to-pink-500/10">
                <User className="h-6 w-6 text-purple-400 light:text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white light:text-gray-900">Manage Account</h3>
                <p className="text-sm text-gray-400 light:text-gray-600">Control your account settings and data</p>
              </div>
            </div>

            {!showDeleteConfirm ? (
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="outline"
                  className="w-full justify-start gap-3 bg-red-900/20 light:bg-red-50 border-red-500/30 light:border-red-200 hover:bg-red-900/30 light:hover:bg-red-100 hover:border-red-500/50 text-red-400 light:text-red-600 h-12 mt-4"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Spotics Account
                </Button>
              </motion.div>
            ) : (
              <div className="mt-4 p-4 rounded-xl bg-red-900/20 light:bg-red-50 border border-red-500/30 light:border-red-300">
                <div className="flex items-start gap-3 mb-4">
                  <Trash2 className="h-5 w-5 text-red-400 light:text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-400 light:text-red-700 mb-1">Delete Your Account?</h4>
                    <p className="text-sm text-red-300 light:text-red-600">
                      This action is permanent and cannot be undone. All your listening data, stats, and preferences will be permanently deleted.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="flex-1 bg-gray-800 light:bg-white border-gray-700 light:border-gray-300 hover:bg-gray-700 light:hover:bg-gray-100 text-white light:text-gray-900"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800 light:border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400 light:text-gray-600">Spotics Version 2.0.0</p>
              <p className="text-xs text-gray-600 light:text-gray-500 mt-1">Last updated: March 19, 2026</p>
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}