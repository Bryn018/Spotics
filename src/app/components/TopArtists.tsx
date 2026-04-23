import type { ArtistStat } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function TopArtists({ artists }: { artists?: ArtistStat[] }) {
  const artistsToShow = artists ?? [];

  return (
    <div className="rounded-2xl bg-[#121212] border border-white/[0.06] overflow-hidden">
      <div className="p-6 pb-4">
        <h2 className="text-xl font-bold text-white">Top Artists</h2>
      </div>
      <div className="px-4 pb-4 space-y-2">
        {artistsToShow.slice(0, 6).map((artist, index) => (
          <div
            key={artist.id}
            className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer"
          >
            {/* Rank */}
            <span className="text-lg font-bold text-gray-600 w-6 text-center group-hover:text-white transition-colors">
              {index + 1}
            </span>

            {/* Artist Image */}
            <div className="relative flex-shrink-0 w-14 h-14">
              <ImageWithFallback
                src={artist.image ?? undefined}
                alt={artist.name}
                gradientSeed={artist.id}
                artistId={artist.id}
                className="w-full h-full rounded-full object-cover shadow-lg ring-2 ring-transparent group-hover:ring-white/10 transition-all"
              />
            </div>

            {/* Artist Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate group-hover:text-green-400 transition-colors text-[15px]">
                {artist.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-gray-400">{artist.plays} plays</span>
                <span className="text-gray-600">•</span>
                <span className="text-sm text-gray-500">{artist.hours}h</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {artist.genres?.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.06] text-gray-400 border border-white/[0.06]"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {artistsToShow.length === 0 && (
          <div className="text-center text-gray-500 py-12">No artists available</div>
        )}
      </div>
    </div>
  );
}
