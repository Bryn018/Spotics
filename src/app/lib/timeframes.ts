import type { TimeRange } from '../types';

export type TimeRangeTab = '4weeks' | '6months' | 'alltime';

export const timeRangeMap: Record<TimeRangeTab, TimeRange> = {
  '4weeks': 'short_term',
  '6months': 'medium_term',
  'alltime': 'long_term',
};

export const timeRangeLabel: Record<TimeRange, string> = {
  short_term: 'Last 4 Weeks',
  medium_term: 'Last 6 Months',
  long_term: 'All Time',
};
