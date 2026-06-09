import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { NavBar } from '../components/NavBar';
import type { ParsedData } from '../context/DataContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Clock, Music, Flame, Calendar, TrendingUp, Globe, Zap, Loader2, Upload } from 'lucide-react';

export function Analytics() {
  const navigate = useNavigate();
  const { data, error } = useData();

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-mono mb-4">Error: {error}</p>
          <button onClick={() => navigate('/')} className="text-green-400 font-mono hover:underline">Upload new data</button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <p className="text-gray-400 font-mono">Loading...</p>
        <button onClick={() => navigate('/')} className="text-green-400 hover:underline font-mono text-sm">
          <Upload className="inline h-4 w-4 mr-1" />Upload your data
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <NavBar currentPage="analytics" />
      <main className="container mx-auto px-4 lg:px-6 py-10 max-w-[1600px]">
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-white font-mono">Analytics</h1>
            <p className="text-gray-500 font-mono text-sm mt-1">Deep dive into your listening patterns</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Clock, label: 'Total Time', value: `${Math.floor(data.totalMinutes / 60)}h ${data.totalMinutes % 60}m`, color: 'text-green-400', bg: 'bg-green-500/10' },
              { icon: Music, label: 'Tracks', value: data.totalTracks.toLocaleString(), color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { icon: Flame, label: 'Streak', value: `${data.currentStreak} days`, color: 'text-orange-400', bg: 'bg-orange-500/10' },
              { icon: Calendar, label: 'Best Day', value: data.bestDay, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`h-8 w-8 rounded-md ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white font-mono">{stat.value}</p>
                  <p className="text-gray-500 font-mono text-xs">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Listening Over Time */}
          <ChartCard title="Listening Over Time" icon={Calendar}>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.listeningChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="label" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                  <Line type="monotone" dataKey="minutes" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Hourly Distribution */}
          <ChartCard title="When You Listen" icon={Clock}>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="hour" stroke="#666" fontSize={10} interval={2} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                  <Bar dataKey="plays" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Two column: Music Taste + Genres */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Music Taste Radar */}
            <ChartCard title="Your Music Taste" icon={Zap}>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={data.musicTaste}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="category" tick={{ fill: '#aaa', fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#666' }} />
                    <Radar name="Taste" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Top Genres */}
            <ChartCard title="Top Genres" icon={Globe}>
              <div className="space-y-4 p-2">
                {data.genres.map((genre, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-300 text-sm font-mono flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: genre.color || '#6b7280' }} />
                        {genre.name}
                      </span>
                      <span className="text-gray-500 text-xs font-mono">{genre.percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${genre.percentage}%`, backgroundColor: genre.color || '#6b7280' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Streaks */}
          <ChartCard title="Listening Streaks" icon={Flame}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
              {data.streaks.map((streak, i) => (
                <div key={i} className={`p-4 rounded-lg border ${streak.active ? 'border-orange-500/30 bg-orange-500/5' : 'border-gray-800 bg-gray-900/50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className={`h-5 w-5 ${streak.active ? 'text-orange-400' : 'text-gray-600'}`} />
                    <span className="text-white font-mono text-sm">{streak.type}</span>
                  </div>
                  <p className="text-2xl font-bold text-white font-mono">{streak.days} <span className="text-sm text-gray-500">days</span></p>
                  <p className="text-gray-500 text-xs mt-1">{streak.description}</p>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </main>
    </div>
  );
}

// Helper component for chart cards
function ChartCard({ title, icon: Icon, children }: { title: string; icon: typeof Clock; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-5">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="h-5 w-5 text-gray-400" />
        <h3 className="text-lg font-bold text-white font-mono">{title}</h3>
      </div>
      {children}
    </div>
  );
}
