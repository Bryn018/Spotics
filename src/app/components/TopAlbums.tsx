import type { AlbumStat } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

const demoAlbums = [
  { id: '1', name: 'After Hours', artist: 'The Weeknd', plays: 1247, image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400', year: '2020' },
  { id: '2', name: 'Midnights', artist: 'Taylor Swift', plays: 987, image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', year: '2022' },
  { id: '3', name: 'AM', artist: 'Arctic Monkeys', plays: 856, image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', year: '2013' },
  { id: '4', name: 'Certified Lover Boy', artist: 'Drake', plays: 743, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', year: '2021' },
  { id: '5', name: 'Future Nostalgia', artist: 'Dua Lipa', plays: 689, image: 'https://images.unsplash.com/photo-1672841821756-fc04525771c2?w=400', year: '2020' },
];

export function TopAlbums({ albums }: { albums?: AlbumStat[] }) {
  const albumsToShow = albums?.length ? albums : demoAlbums;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {albumsToShow.map((album, index) => (
        <div key={album.id} className="group cursor-pointer">
          <div className="relative mb-3">
            <div className="absolute -top-2 -left-2 bg-gradient-to-br from-green-500 to-blue-500 rounded-full w-8 h-8 flex items-center justify-center text-white text-sm font-bold z-10 shadow-lg">
              {index + 1}
            </div>
            <ImageWithFallback
              src={album.image ?? ''}
              alt={album.name}
              className="w-full aspect-square rounded-xl object-cover shadow-lg group-hover:shadow-green-500/20 transition-all duration-300 group-hover:scale-105"
            />
          </div>
          <h3 className="text-white font-medium truncate">{album.name}</h3>
          <p className="text-gray-400 text-sm truncate">{album.artist}</p>
          <p className="text-gray-500 text-xs mt-1">
            {(album as any).year ?? ''} {album.plays.toLocaleString()} plays
          </p>
        </div>
      ))}
    </div>
  );
}
