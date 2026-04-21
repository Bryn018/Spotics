import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { ArtistStat } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

const demoArtists = [
  { id: '1', name: 'The Weeknd', plays: 847, hours: 42, image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400', genres: ['Pop', 'R&B'] },
  { id: '2', name: 'Taylor Swift', plays: 612, hours: 36, image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', genres: ['Pop', 'Country'] },
  { id: '3', name: 'Drake', plays: 534, hours: 29, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', genres: ['Hip Hop', 'Rap'] },
  { id: '4', name: 'Arctic Monkeys', plays: 478, hours: 24, image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', genres: ['Rock', 'Indie'] },
  { id: '5', name: 'Calvin Harris', plays: 421, hours: 21, image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400', genres: ['Electronic', 'Dance'] },
];

export function TopArtists({ artists }: { artists?: ArtistStat[] }) {
  const artistsToShow = artists?.length ? artists : demoArtists;

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-white">Top Artists</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {artistsToShow.map((artist, index) => (
            <div
              key={artist.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <span className="text-lg font-bold text-gray-500 w-6 text-center group-hover:text-blue-400 transition-colors">
                {index + 1}
              </span>
              <ImageWithFallback
                src={artist.image ?? ''}
                alt={artist.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-800 group-hover:ring-blue-500/50 transition-all"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{artist.name}</p>
                <p className="text-gray-400 text-sm">{artist.plays} plays</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-gray-400 text-sm">{artist.hours}h</p>
                <p className="text-gray-500 text-xs">{artist.genres?.slice(0, 2).join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
