import type { ArtistStat } from '../types';
import { Users } from 'lucide-react';

interface TopArtistsProps {
  items: ArtistStat[];
}

export function TopArtists({ items }: TopArtistsProps) {
  if (items.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-6">
        <p className="text-gray-500 font-mono">No artists found</p>
      </div>
    );
  }

  const maxPlays = items[0]?.plays || 1;

  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg">
      <div className="flex items-center gap-3 p-5 border-b border-gray-800/50">
        <div className="h-8 w-8 rounded-md bg-blue-500/10 flex items-center justify-center">
          <Users className="h-4 w-4 text-blue-400" />
        </div>
        <h2 className="text-lg font-bold text-white font-mono">Top Artists</h2>
      </div>
      <div className="divide-y divide-gray-800/30">
        {items.map((artist, i) => (
          <div key={artist.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-800/20 transition-colors">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-gray-600 font-mono text-sm w-6 text-right shrink-0">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium text-sm truncate">{artist.name}</p>
                <div className="mt-1 h-1.5 bg-gray-800 rounded-full overflow-hidden w-full max-w-[120px]">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(artist.plays / maxPlays) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-right shrink-0 ml-3">
              <span className="text-blue-400 font-mono text-sm">{artist.plays}</span>
              <span className="text-gray-600 text-xs ml-1">plays</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
