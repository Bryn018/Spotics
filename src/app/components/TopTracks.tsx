import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Play, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import type { TrackStat } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

const demoTracks = [
  { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', plays: 247, durationLabel: '3:20', image: 'https://images.unsplash.com/photo-1616663395403-2e0052b8e595?w=400' },
  { id: '2', title: 'Stay', artist: 'The Kid LAROI, Justin Bieber', album: 'Stay', plays: 198, durationLabel: '2:21', image: 'https://images.unsplash.com/photo-1563681543778-002ee8f3cd8a?w=400' },
  { id: '3', title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", plays: 176, durationLabel: '2:47', image: 'https://images.unsplash.com/photo-1718217028088-a23cb3b277c4?w=400' },
  { id: '4', title: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland', plays: 154, durationLabel: '3:59', image: 'https://images.unsplash.com/photo-1770287329282-1fabdc26248b?w=400' },
  { id: '5', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', plays: 143, durationLabel: '3:23', image: 'https://images.unsplash.com/photo-1672841821756-fc04525771c2?w=400' },
];

export function TopTracks({ tracks }: { tracks?: TrackStat[] }) {
  const tracksToShow = tracks?.length ? tracks : demoTracks;

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-white">Top Tracks</CardTitle>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tracksToShow.map((track, index) => (
            <div
              key={track.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <span className="text-lg font-bold text-gray-500 w-6 text-center group-hover:text-green-400 transition-colors">
                {index + 1}
              </span>
              <ImageWithFallback
                src={track.image ?? ''}
                alt={track.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{track.title}</p>
                <p className="text-gray-400 text-sm truncate">{track.artist}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-gray-400 text-sm">{track.plays} plays</p>
                <p className="text-gray-500 text-xs">{track.durationLabel ?? ''}</p>
              </div>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-4 w-4 text-green-400" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
