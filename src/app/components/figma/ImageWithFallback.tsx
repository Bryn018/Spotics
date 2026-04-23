import React, { useState, useMemo, useEffect } from 'react'
import { Disc3 } from 'lucide-react'
import { api, apiBaseUrl } from '../../lib/api'

interface ImageWithFallbackProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  gradientSeed?: string;
  trackId?: string;
  artistId?: string;
}

const GRADIENT_PAIRS = [
  ['from-emerald-500', 'to-teal-600'],
  ['from-blue-500', 'to-indigo-600'],
  ['from-violet-500', 'to-purple-600'],
  ['from-rose-500', 'to-pink-600'],
  ['from-amber-500', 'to-orange-600'],
  ['from-cyan-500', 'to-blue-600'],
  ['from-fuchsia-500', 'to-rose-600'],
  ['from-lime-500', 'to-green-600'],
  ['from-sky-500', 'to-cyan-600'],
  ['from-indigo-500', 'to-violet-600'],
];

function getGradientFromSeed(seed?: string): [string, string] {
  if (!seed) return GRADIENT_PAIRS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PAIRS.length;
  return GRADIENT_PAIRS[index];
}

// Cache fetched image URLs to avoid repeated API calls
const imageUrlCache = new Map<string, string | null>();

async function fetchTrackImage(trackId: string): Promise<string | null> {
  if (imageUrlCache.has(trackId)) return imageUrlCache.get(trackId) ?? null;
  try {
    const { data } = await api.get<{ success: boolean; data: { imageUrl: string | null } }>(`/api/tracks/${trackId}/image`);
    const url = data.data?.imageUrl ?? null;
    imageUrlCache.set(trackId, url);
    return url;
  } catch {
    imageUrlCache.set(trackId, null);
    return null;
  }
}

async function fetchArtistImage(artistId: string): Promise<string | null> {
  if (imageUrlCache.has(artistId)) return imageUrlCache.get(artistId) ?? null;
  try {
    const { data } = await api.get<{ success: boolean; data: { imageUrl: string | null } }>(`/api/artists/${artistId}/image`);
    const url = data.data?.imageUrl ?? null;
    imageUrlCache.set(artistId, url);
    return url;
  } catch {
    imageUrlCache.set(artistId, null);
    return null;
  }
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)
  const [fetchedSrc, setFetchedSrc] = useState<string | null>(null)
  const { src, alt, style, className, gradientSeed, trackId, artistId, ...rest } = props
  const [from, to] = useMemo(() => getGradientFromSeed(gradientSeed || alt), [gradientSeed, alt]);

  const effectiveSrc = src || fetchedSrc;

  useEffect(() => {
    // If no src but we have an ID, try to fetch the image
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

  const handleError = () => {
    setDidError(true)
  }

  if (!effectiveSrc || effectiveSrc === '' || didError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-800 bg-gradient-to-br ${from} ${to} overflow-hidden ${className ?? ''}`}
        style={style}
        title={alt}
      >
        <Disc3 className="h-6 w-6 text-white/60" />
      </div>
    )
  }

  return (
    <img src={effectiveSrc} alt={alt || ''} className={className} style={style} {...rest} onError={handleError} loading="lazy" />
  )
}
