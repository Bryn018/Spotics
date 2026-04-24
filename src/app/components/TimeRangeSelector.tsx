import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

interface TimeRangeSelectorProps {
  currentRange: 'short_term' | 'medium_term' | 'long_term';
  onChange: (range: 'short_term' | 'medium_term' | 'long_term') => void;
}

const RANGE_LABELS: Record<string, string> = {
  short_term: 'Last 4 Weeks',
  medium_term: 'Last 6 Months',
  long_term: 'All Time',
};

export function TimeRangeSelector({ currentRange, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Your Music Stats</h2>
        <p className="text-sm text-gray-400 mt-1">Track your listening habits and discover your musical journey</p>
      </div>

      <Tabs value={currentRange} onValueChange={(value) => onChange(value as 'short_term' | 'medium_term' | 'long_term')} className="hidden sm:block">
        <TabsList className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 p-1">
          {(['short_term', 'medium_term', 'long_term'] as const).map((range) => (
            <TabsTrigger
              key={range}
              value={range}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white transition-all px-4 py-2 text-sm font-semibold"
            >
              {RANGE_LABELS[range]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
