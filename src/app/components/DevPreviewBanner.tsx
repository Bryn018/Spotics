import { useState, useEffect } from 'react';
import { isDevPreviewEnabled, disableDevPreview } from '../lib/devPreview';
import { Eye, X } from 'lucide-react';

export function DevPreviewBanner() {
  const [enabled, setEnabled] = useState(false);
  
  useEffect(() => {
    setEnabled(isDevPreviewEnabled());
    
    // Listen for storage changes to update banner when devpreview is toggled in another tab
    const handleStorageChange = () => setEnabled(isDevPreviewEnabled());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!enabled) return null;

  return (
    <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        <div className="flex items-center gap-2 text-amber-400 text-sm">
          <Eye className="h-4 w-4" />
          <span className="font-medium">Dev Preview Mode</span>
          <span className="opacity-70 hidden sm:inline">— Mock data displayed, no Spotify auth required</span>
        </div>
        <button 
          onClick={disableDevPreview} 
          className="text-amber-400/80 hover:text-amber-400 text-sm flex items-center gap-1"
        >
          <X className="h-4 w-4" /> Exit Preview
        </button>
      </div>
    </div>
  );
}
