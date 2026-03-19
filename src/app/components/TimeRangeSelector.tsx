import { formatDistanceToNow } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { useDashboardData } from '../context/DashboardContext';
import type { TimeRange } from '../types';

const ranges: { label: string; value: TimeRange; description: string }[] = [
  { label: 'Last 4 Weeks', value: 'short_term', description: 'Fresh discoveries' },
  { label: 'Last 6 Months', value: 'medium_term', description: 'Seasonal trends' },
  { label: 'All Time', value: 'long_term', description: 'Lifetime favorites' },
];

export function TimeRangeSelector() {
  const { timeframe, setTimeframe, data, sync, syncing } = useDashboardData();
  const lastFetched = data?.summary?.fetchedAt;
  const lastUpdatedLabel = lastFetched
    ? formatDistanceToNow(new Date(lastFetched), { addSuffix: true })
    : 'Never';

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-white">Your Music Stats</h2>
        <p className="text-sm text-gray-400 mt-1">
          Track your listening habits and explore what defined your soundtrack.
        </p>
        <p className="text-xs text-gray-500 mt-2">Last refreshed: {lastUpdatedLabel}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as TimeRange)}>
          <TabsList className="bg-gray-900/50 border border-gray-800">
            {ranges.map((range) => (
              <TabsTrigger
                key={range.value}
                value={range.value}
                className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                <div className="flex flex-col">
                  <span>{range.label}</span>
                  <span className="text-[11px] text-gray-400">{range.description}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Button
          onClick={() => sync()}
          disabled={syncing}
          className="bg-gradient-to-r from-purple-500 to-pink-500 whitespace-nowrap"
        >
          {syncing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh data
        </Button>
      </div>
    </div>
  );
}
