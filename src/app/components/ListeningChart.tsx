interface ListeningChartPoint {
  label: string;
  minutes: number;
}

interface ListeningChartProps {
  data: ListeningChartPoint[];
}

export function ListeningChart({ data }: ListeningChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.08] p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Listening Chart</h3>
        <p className="text-gray-400">No listening data available</p>
      </div>
    );
  }

  const maxMinutes = Math.max(...data.map((d) => d.minutes));

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.08] p-6 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-white" />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Listening Time</h3>
        </div>
        <div className="h-48 flex items-end justify-between gap-2">
          {data.map((point, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-md relative group/bar" style={{ height: `${(point.minutes / maxMinutes) * 100}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-white opacity-0 group-hover/bar:opacity-100 transition-opacity">
                  {point.minutes}m
                </div>
              </div>
              <span className="text-xs text-gray-400">{point.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
