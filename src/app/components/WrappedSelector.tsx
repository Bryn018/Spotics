import { useState } from 'react';
import { Button } from './ui/button';
import { Calendar, Play, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { DailyWrapDialog } from './DailyWrapDialog';
import { WeeklyWrapDialog } from './WeeklyWrapDialog';
import { YearlyWrapDialog } from './YearlyWrapDialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useDashboardData } from '../context/DashboardContext';

const WRAP_TABS = [
  { id: 'daily', label: 'Daily', icon: Calendar },
  { id: 'weekly', label: 'Weekly', icon: TrendingUp },
  { id: 'yearly', label: 'Yearly', icon: Sparkles },
] as const;

type WrapTab = (typeof WRAP_TABS)[number]['id'];

export function WrappedSelector() {
  const [activeWrap, setActiveWrap] = useState<WrapTab>('yearly');
  const [dailyOpen, setDailyOpen] = useState(false);
  const [weeklyOpen, setWeeklyOpen] = useState(false);
  const [yearlyOpen, setYearlyOpen] = useState(false);
  const { data } = useDashboardData();
  const stats = data?.summary?.payload?.stats;

  const heroCopy: Record<WrapTab, { title: React.ReactNode; description: React.ReactNode; badge: string }> = {
    daily: {
      title: 'Your Day in Music',
      description: (
        <>
          You listened to <strong>{data?.activities?.length ?? 0} songs</strong> today.
          <span className="block text-gray-400 mt-2">Keep the streak alive.</span>
        </>
      ),
      badge: 'Today',
    },
    weekly: {
      title: "This Week's Soundtrack",
      description: (
        <>
          {(stats?.totalTracks ?? 0) / 4 > 0 && (
            <strong>{Math.round((stats?.totalTracks ?? 0) / 4)}</strong>
          )}{' '}
          tracks kept you company this week.
          <span className="block text-gray-400 mt-2">See how your habits changed.</span>
        </>
      ),
      badge: 'This Week',
    },
    yearly: {
      title: (
        <span className="font-['Brush_Script_MT',_'Lucida_Handwriting',_cursive] italic tracking-wide text-emerald-200">
          Insights
        </span>
      ),
      description: (
        <span className="font-['Brush_Script_MT',_'Lucida_Handwriting',_cursive] text-xl md:text-2xl italic leading-relaxed text-emerald-100">
          {(stats?.totalTracks ?? 0).toLocaleString()} songs from {(stats?.totalArtists ?? 0).toLocaleString()} artists shaped your year.
          <span className="block mt-2 text-emerald-300">Let's dive into what moved you.</span>
        </span>
      ),
      badge: 'Year in Review',
    },
  };

  const handleView = () => {
    if (activeWrap === 'daily') setDailyOpen(true);
    else if (activeWrap === 'weekly') setWeeklyOpen(true);
    else setYearlyOpen(true);
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-emerald-900/20 to-gray-900 border border-gray-800/50">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1575318080244-dd217d9db1e2?auto=format&fit=crop&w=1200&q=80"
            alt="Ambient lights"
            className="w-full h-full object-cover opacity-15"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent" />

        <div className="relative p-8 md:p-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-300 uppercase tracking-wide">{heroCopy[activeWrap].badge}</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">{heroCopy[activeWrap].title}</h2>
              <p className="text-lg text-gray-300 mb-8 max-w-xl">{heroCopy[activeWrap].description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {WRAP_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeWrap === tab.id;
                  return (
                    <Button
                      key={tab.id}
                      onClick={() => setActiveWrap(tab.id)}
                      variant={active ? 'default' : 'outline'}
                      className={
                        active
                          ? tab.id === 'yearly'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                            : 'bg-emerald-500 text-white'
                          : 'bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800'
                      }
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </Button>
                  );
                })}
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className={`text-white ${
                    activeWrap === 'daily'
                      ? 'bg-teal-500 hover:bg-teal-600'
                      : activeWrap === 'weekly'
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                  }`}
                  onClick={handleView}
                >
                  <Play className="h-4 w-4 mr-2" fill="white" />
                  View {activeWrap === 'daily' ? 'Today' : activeWrap === 'weekly' ? 'This Week' : 'Your Year'}
                </Button>
              </motion.div>
            </div>

            <div className="hidden lg:block relative flex-shrink-0">
              <div className="relative w-64 h-64 rounded-xl overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80"
                  alt="Music collage"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <DailyWrapDialog open={dailyOpen} onOpenChange={setDailyOpen} />
      <WeeklyWrapDialog open={weeklyOpen} onOpenChange={setWeeklyOpen} />
      <YearlyWrapDialog open={yearlyOpen} onOpenChange={setYearlyOpen} />
    </>
  );
}
