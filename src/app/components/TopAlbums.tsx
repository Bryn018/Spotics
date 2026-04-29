import { Card, CardContent } from './ui/card';

export function TopAlbums() {
  const albums = [
    {
      id: 1,
      title: 'After Hours',
      artist: 'The Weeknd',
      year: '2020',
      plays: 1247,
      tracks: 14,
      image: 'https://images.unsplash.com/photo-1618336215696-6673cf4549ae?w=400'
    },
    {
      id: 2,
      title: 'Midnights',
      artist: 'Taylor Swift',
      year: '2022',
      plays: 987,
      tracks: 13,
      image: 'https://images.unsplash.com/photo-1761682704492-b7ed11edfda7?w=400'
    },
    {
      id: 3,
      title: 'AM',
      artist: 'Arctic Monkeys',
      year: '2013',
      plays: 856,
      tracks: 12,
      image: 'https://images.unsplash.com/photo-1545110333-c40d8bd01891?w=400'
    },
    {
      id: 4,
      title: 'Certified Lover Boy',
      artist: 'Drake',
      year: '2021',
      plays: 743,
      tracks: 21,
      image: 'https://images.unsplash.com/photo-1760302318706-e4ae9fbde12c?w=400'
    },
    {
      id: 5,
      title: 'Future Nostalgia',
      artist: 'Dua Lipa',
      year: '2020',
      plays: 689,
      tracks: 11,
      image: 'https://images.unsplash.com/photo-1718670013939-954787e56385?w=400'
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 light:from-white light:to-gray-50 border-gray-800/50 light:border-gray-200 shadow-xl">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {albums.map((album, index) => (
            <div
              key={album.id}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 light:from-gray-50 light:to-white p-4 hover:from-purple-900/20 hover:to-pink-900/20 light:hover:from-purple-100/50 light:hover:to-pink-100/50 transition-all hover:scale-[1.02] border border-gray-700/30 light:border-gray-200 hover:border-purple-500/30"
            >
              <div className="relative mb-3">
                <img
                  src={album.image}
                  alt={album.title}
                  className="w-full aspect-square rounded-lg object-cover shadow-xl ring-2 ring-gray-800 light:ring-gray-200 group-hover:ring-purple-500/30 transition-all"
                />
                <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                  #{index + 1}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-bold text-white light:text-gray-900 truncate">{album.title}</h3>
                <p className="text-sm text-gray-400 light:text-gray-600 truncate">{album.artist}</p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-700/50 light:border-gray-200">
                  <span className="text-xs text-gray-500 light:text-gray-500">{album.year}</span>
                  <span className="text-xs text-purple-400 light:text-purple-600 font-semibold">{album.plays} plays</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}