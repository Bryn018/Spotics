import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { useTimeRange } from '../contexts/TimeRangeContext';

export function TimeRangeSelector() {
  const { timeRange, setTimeRange } = useTimeRange();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Your Music Stats</h2>
        <p className="text-sm text-gray-400 mt-1">Track your listening habits and discover your musical journey</p>
      </div>

      <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as '4weeks' | '6months' | 'alltime')} className="hidden sm:block">
        <TabsList className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 p-1">
          <TabsTrigger
            value="4weeks"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white transition-all px-4 py-2 text-sm font-semibold"
          >
            Last 4 Weeks
          </TabsTrigger>
          <TabsTrigger
            value="6months"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white transition-all px-4 py-2 text-sm font-semibold"
          >
            Last 6 Months
          </TabsTrigger>
          <TabsTrigger
            value="alltime"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/30 data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white transition-all px-4 py-2 text-sm font-semibold"
          >
            All Time
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}