import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

export function TimeRangeSelector() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Your Music Stats</h2>
        <p className="text-sm text-gray-400 mt-1">Track your listening habits and discover your musical journey</p>
      </div>
      
      <Tabs defaultValue="4weeks" className="hidden sm:block">
        <TabsList className="bg-gray-900/50 border border-gray-800">
          <TabsTrigger 
            value="4weeks"
            className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
          >
            Last 4 Weeks
          </TabsTrigger>
          <TabsTrigger 
            value="6months"
            className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
          >
            Last 6 Months
          </TabsTrigger>
          <TabsTrigger 
            value="alltime"
            className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
          >
            All Time
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
