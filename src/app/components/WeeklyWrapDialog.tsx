import { useMemo } from 'react';

interface Props {
  data?: any[];
}

export function WeeklyWrapDialog({ data = [] }: Props) {
  const totalTracks = useMemo(() => data.reduce((acc, item) => acc + (item.tracks?.length || 0), 0), [data]);
  const totalHours = useMemo(() => data.reduce((acc, item) => acc + (item.hours || 0), 0), [data]);
  const totalMinutes = useMemo(() => data.reduce((acc, item) => acc + (item.minutes || 0), 0), [data]);
  const uniqueArtists = useMemo(() => {
    const artists = new Set(data.flatMap((item) => item.artists || []));
    return artists.size;
  }, [data]);

  return (
    <div>
      <div>Total Tracks: {totalTracks}</div>
      <div>Total Hours: {totalHours}</div>
      <div>Total Minutes: {totalMinutes}</div>
      <div>Unique Artists: {uniqueArtists}</div>
    </div>
  );
}
