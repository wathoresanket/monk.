import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { useMonk } from '@/contexts/MonkContext';
import { TimeScope } from '@/types/monk';
import {
  calculateStats,
  formatDuration,
  getStartOfWeek,
  getStartOfMonth,
  getDateString,
  generateDailyInsight,
  generateWeeklyInsight,
} from '@/lib/utils';
import { TimeOfDayChart, RhythmChart, MoodDistribution } from '@/components/reflection';
import { cn } from '@/lib/utils';

interface ReflectionsScreenProps {
  onClose: () => void;
}

const SCOPE_LABELS: Record<TimeScope, string> = {
  week: 'This Week',
  month: 'This Month',
  all: 'All Time',
};

export function ReflectionsScreen({ onClose }: ReflectionsScreenProps) {
  const { moments } = useMonk();
  const [scope, setScope] = useState<TimeScope>('week');

  // Filter moments by scope
  const filteredMoments = useMemo(() => {
    const now = new Date();

    switch (scope) {
      case 'week': {
        const weekStart = getStartOfWeek(now);
        const weekStartStr = getDateString(weekStart);
        return moments.filter((m) => m.date >= weekStartStr);
      }
      case 'month': {
        const monthStart = getStartOfMonth(now);
        const monthStartStr = getDateString(monthStart);
        return moments.filter((m) => m.date >= monthStartStr);
      }
      case 'all':
      default:
        return moments;
    }
  }, [moments, scope]);

  const stats = useMemo(() => calculateStats(filteredMoments), [filteredMoments]);

  // Generate insights
  const dailyInsight = useMemo(() => generateDailyInsight(moments), [moments]);
  const weeklyInsight = useMemo(() => generateWeeklyInsight(moments), [moments]);

  const scopes: TimeScope[] = ['week', 'month', 'all'];

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="min-h-screen max-w-lg mx-auto p-8">
        {/* Header */}
        <header data-tauri-drag-region className="flex items-center justify-between mb-8">
          <h1 className="monk-title text-foreground">Reflections</h1>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-lg transition-all duration-400 ease-monk-gentle",
              "text-muted-foreground hover:text-foreground",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Scope selector */}
        <div className="flex justify-center gap-2 mb-10">
          {scopes.map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-400 ease-monk-gentle",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                scope === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {SCOPE_LABELS[s]}
            </button>
          ))}
        </div>

        {/* AI Insights (if available) */}
        {(dailyInsight || weeklyInsight) && (
          <div className="mb-10 p-6 rounded-xl bg-card border border-border animate-monk-fade-in">
            {dailyInsight && (
              <p className="monk-body text-foreground/80 italic">
                {dailyInsight.text}
              </p>
            )}
            {weeklyInsight && dailyInsight && <div className="h-3" />}
            {weeklyInsight && (
              <p className="monk-body text-foreground/80 italic">
                {weeklyInsight.text}
              </p>
            )}
          </div>
        )}

        {/* Global Summary */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <SummaryCard
            label="Minutes of Focus"
            value={formatDuration(stats.totalMinutes)}
          />
          <SummaryCard
            label="Deepest Moment"
            value={stats.deepestMoment > 0 ? `${stats.deepestMoment} min` : '—'}
          />
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {/* Your Rhythm */}
          <section className="animate-monk-fade-in" style={{ animationDelay: '100ms' }}>
            <h2 className="monk-heading text-foreground mb-6">Your Rhythm</h2>
            <RhythmChart stats={stats} scope={scope} />
          </section>

          {/* When You Find Focus */}
          <section className="animate-monk-fade-in">
            <section className="space-y-4">
              <h2 className="monk-heading text-lg text-foreground">When you find focus</h2>
              <TimeOfDayChart stats={stats} scope={scope} />
            </section>
          </section>

          {/* How Your Moments Felt */}
          <section className="animate-monk-fade-in" style={{ animationDelay: '300ms' }}>
            <h2 className="monk-heading text-foreground mb-6">How Your Moments Felt</h2>
            <MoodDistribution
              distribution={stats.moodDistribution}
              totalCount={stats.completedCount}
            />
          </section>
        </div>

        {/* Empty state */}
        {filteredMoments.length === 0 && (
          <div className="text-center py-16 animate-monk-fade-in">
            <p className="monk-body text-muted-foreground">
              This space will fill gently as you return.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border text-center">
          <p className="monk-caption opacity-60">
            {moments.length} moment{moments.length !== 1 ? 's' : ''} recorded
          </p>
        </footer>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6 rounded-xl bg-card border border-border text-center">
      <p className="monk-caption mb-2">{label}</p>
      <p className="monk-title text-foreground">{value}</p>
    </div>
  );
}
