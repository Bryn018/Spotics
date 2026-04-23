import { useState, useEffect, useRef } from 'react';
import { Disc3, Music } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  trackId?: string;
  artistId?: string;
  gradientSeed?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const GRADIENT_PAIRS = [
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-fuchsia-500 to-pink-600',
  'from-rose-500 to-red-600',
  'from-orange-500 to-amber-600',
  'from-cyan-500 to-blue-600',
  'from-lime-500 to-green-600',
  'from-purple-500 to-pink-600',
  'from-indigo-500 to-violet-600',
];

function getGradientFromSeed(seed?: string): string {
  if (!seed) return GRADIENT_PAIRS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PAIRS.length;
  return GRADIENT_PAIRS[index];
}

function getInitials(name?: string): string {
  if (!name) return '';
  const words = name.split(/[\s&,-]+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

async function fetchTrackImage(trackId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/tracks/${trackId}/image`);
    const json = await res.json();
    return json?.data?.imageUrl ?? null;
  } catch {
    return null;
  }
}

async function fetchArtistImage(artistId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/artists/${artistId}/image`);
    const json = await res.json();
    return json?.data?.imageUrl ?? null;
  } catch {
    return null;
  }
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchedSrc, setFetchedSrc] = useState<string | null>(null);
  const { src, alt, className, style, gradientSeed, trackId, artistId, size = 'md', ...rest } = props;
  const gradient = getGradientFromSeed(gradientSeed || alt || trackId || artistId);
  const hasFetched = useRef(false);

  const effectiveSrc = src || fetchedSrc;

  useEffect(() => {
    if (!src && !fetchedSrc && !didError && !hasFetched.current) {
      if (trackId) {
        hasFetched.current = true;
        fetchTrackImage(trackId).then((url) => {
          if (url) setFetchedSrc(url);
        });
      } else if (artistId) {
        hasFetched.current = true;
        fetchArtistImage(artistId).then((url) => {
          if (url) setFetchedSrc(url);
        });
      }
    }
  }, [src, fetchedSrc, didError, trackId, artistId]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setDidError(true);
  };

  if (effectiveSrc && !didError) {
    return (
      <div className="relative w-full h-full">
        {isLoading && (
          <div
            className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradient} animate-pulse ${className ?? ''}`}
            style={style}
          >
            <Music className="h-5 w-5 text-white/40" />
          </div>
        )}
        <img
          src={effectiveSrc}
          alt={alt || ''}
          className={`${className ?? ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={style}
          {...rest}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      </div>
    );
  }

  const initials = getInitials(alt);

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br ${gradient} overflow-hidden ${className ?? ''}`}
      style={style}
      title={alt}
    >
      {initials ? (
        <span className="text-white/90 font-bold select-none" style={{ fontSize: size === 'sm' ? '10px' : size === 'md' ? '14px' : size === 'lg' ? '20px' : '28px' }}>
          {initials}
        </span>
      ) : (
        <Disc3 className="h-6 w-6 text-white/70" />
      )}
    </div>
  );
}
