import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export function TopArtists() {
  const artists = [
    {
      id: 1,
      name: 'The Weeknd',
      plays: 847,
      hours: 42.3,
      image: 'https://images.unsplash.com/photo-1541293590517-e76751af59f1?w=400',
      genres: ['Pop', 'R&B']
    },
    {
      id: 2,
      name: 'Taylor Swift',
      plays: 612,
      hours: 35.7,
      image: 'https://images.unsplash.com/photo-1563681543778-002ee8f3cd8a?w=400',
      genres: ['Pop', 'Country']
    },
    {
      id: 3,
      name: 'Drake',
      plays: 534,
      hours: 28.9,
      image: 'https://images.unsplash.com/photo-1770287329282-1fabdc26248b?w=400',
      genres: ['Hip Hop', 'Rap']
    },
    {
      id: 4,
      name: 'Arctic Monkeys',
      plays: 478,
      hours: 24.1,
      image: 'https://images.unsplash.com/photo-1762917903361-99e0164dbcc5?w=400',
      genres: ['Rock', 'Indie']
    },
    {
      id: 5,
      name: 'Calvin Harris',
      plays: 421,
      hours: 21.5,
      image: 'https://images.unsplash.com/photo-1712530708772-49749a0bad58?w=400',
      genres: ['Electronic', 'Dance']
    },
    {
      id: 6,
      name: 'Bon Iver',
      plays: 389,
      hours: 19.8,
      image: 'https://images.unsplash.com/photo-1512153129600-528cae82b06a?w=400',
      genres: ['Indie', 'Folk']
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800/50 shadow-xl">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {artists.map((artist, index) => (
            <div
              key={artist.id}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-5 hover:from-purple-900/20 hover:to-pink-900/20 transition-all hover:scale-[1.02] border border-gray-700/30 hover:border-purple-500/30"
            >
              {/* Rank Badge */}
              <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-xs font-bold text-purple-300 border border-purple-500/30">
                {index + 1}
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-purple-500/30 group-hover:ring-purple-500/50 transition-all shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-gray-900"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate mb-1">{artist.name}</h3>
                  <p className="text-sm text-purple-400 font-medium">{artist.plays} plays</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-800/40">
                  <span className="text-xs text-gray-400">Listening time</span>
                  <span className="text-sm text-white font-semibold">{artist.hours}h</span>
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  {artist.genres.map((genre, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}