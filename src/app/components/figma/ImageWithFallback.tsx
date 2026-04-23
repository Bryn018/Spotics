import { useState, useEffect } from 'react';
import { Disc3 } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  trackId?: string;
  artistId?: string;
  gradientSeed?: string;
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
  const [fetchedSrc, setFetchedSrc] = useState<string | null>(null);
  const { src, alt, className, style, gradientSeed, trackId, artistId, ...rest } = props;
  const gradient = getGradientFromSeed(gradientSeed || alt || trackId || artistId);

  const effectiveSrc = src || fetchedSrc;

  useEffect(() => {
    if (!src && !fetchedSrc && !didError) {
      if (trackId) {
        fetchTrackImage(trackId).then((url) => {
          if (url) setFetchedSrc(url);
        });
      } else if (artistId) {
        fetchArtistImage(artistId).then((url) => {
          if (url) setFetchedSrc(url);
        });
      }
    }
  }, [src, fetchedSrc, didError, trackId, artistId]);

  if (effectiveSrc && !didError) {
    return (
      <img
        src={effectiveSrc}
        alt={alt || ''}
        className={className}
        style={style}
        {...rest}
        onError={() => setDidError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br ${gradient} overflow-hidden ${className ?? ''}`}
      style={style}
      title={alt}
    >
      <Disc3 className="h-6 w-6 text-white/70" />
    </div>
  );
}
