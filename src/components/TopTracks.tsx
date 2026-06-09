import type { TrackStat } from '../types';
import { Play } from 'lucide-react';

interface TopTracksProps {
  items: TrackStat[];
}

export function TopTracks({ items }: TopTracksProps) {
  if (items.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-6">
        <p className="text-gray-500 font-mono">No tracks found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg">
      <div className="flex items-center gap-3 p-5 border-b border-gray-800/50">
        <div className="h-8 w-8 rounded-md bg-green-500/10 flex items-center justify-center">
          <Play className="h-4 w-4 text-green-400" />
        </div>
        <h2 className="text-lg font-bold text-white font-mono">Top Tracks</h2>
      </div>
      <div className="divide-y divide-gray-800/30">
        {items.map((track, i) => (
          <div key={track.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-800/20 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-mono text-sm w-6 text-right">{i + 1}</span>
              <div>
                <p className="text-white font-medium text-sm">{track.title}</p>
                <p className="text-gray-500 text-xs">{track.artist}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-green-400 font-mono text-sm">{track.plays}</span>
              <span className="text-gray-600 text-xs ml-1">plays</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
