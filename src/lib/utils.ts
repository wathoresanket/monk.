import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TimeOfDay, Moment, MoodType, MomentStats, PatternInsight } from "@/types/monk";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Time utilities
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function getDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Date range utilities
export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getStartOfMonth(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getDaysInRange(startDate: Date, endDate: Date): string[] {
  const days: string[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(getDateString(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

// Stats calculation
export function calculateStats(moments: Moment[]): MomentStats {
  // Filter for valid focus sessions (completed OR interrupted with duration)
  const validMoments = moments.filter((m) => m.type === 'focus' && m.duration > 0);

  const totalMinutes = Math.round(validMoments.reduce((sum, m) => sum + m.duration, 0));
  const deepestMoment = Math.round(Math.max(...validMoments.map((m) => m.duration), 0));
  const momentCount = validMoments.length;
  const completedCount = validMoments.filter(m => m.completed).length;
  // Calculate average first
  const rawAverage = momentCount > 0 ? validMoments.reduce((sum, m) => sum + m.duration, 0) / momentCount : 0;

  const moodDistribution: Record<MoodType, number> = {
    clear: 0,
    neutral: 0,
    scattered: 0,
  };

  const timeOfDayDistribution: Record<TimeOfDay, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
  };

  const timeOfDayMinutes: Record<TimeOfDay, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
  };

  const dailyMinutes: Record<string, number> = {};

  validMoments.forEach((m) => {
    if (m.mood) {
      moodDistribution[m.mood]++;
    }
    timeOfDayDistribution[m.timeOfDay]++;
    timeOfDayMinutes[m.timeOfDay] += m.duration;
    dailyMinutes[m.date] = (dailyMinutes[m.date] || 0) + m.duration;
  });

  // Round daily minutes to integers
  Object.keys(dailyMinutes).forEach(key => {
    dailyMinutes[key] = Math.round(dailyMinutes[key]);
  });

  // Round average duration
  const avgDurationRounded = Math.round(rawAverage);

  return {
    totalMinutes,
    deepestMoment,
    momentCount,
    completedCount,
    averageDuration: avgDurationRounded,
    moodDistribution,
    timeOfDayDistribution,
    timeOfDayMinutes,
    dailyMinutes,
  };
}

// Pattern-based insights generation
export function generateDailyInsight(moments: Moment[], today: Date = new Date()): PatternInsight | null {
  const todayStr = getDateString(today);
  const yesterdayStr = getDateString(new Date(today.getTime() - 24 * 60 * 60 * 1000));

  const todayMoments = moments.filter((m) => m.date === todayStr && m.completed);
  const yesterdayMoments = moments.filter((m) => m.date === yesterdayStr && m.completed);

  if (todayMoments.length === 0) {
    return null;
  }

  const todayMinutes = todayMoments.reduce((sum, m) => sum + m.duration, 0);
  const yesterdayMinutes = yesterdayMoments.reduce((sum, m) => sum + m.duration, 0);

  // Check mood patterns
  const clearCount = todayMoments.filter((m) => m.mood === 'clear').length;
  const scatteredCount = todayMoments.filter((m) => m.mood === 'scattered').length;

  // Check time of day patterns
  const morningCount = todayMoments.filter((m) => m.timeOfDay === 'morning').length;
  const eveningCount = todayMoments.filter((m) => m.timeOfDay === 'evening').length;

  let text = '';

  if (clearCount > scatteredCount && clearCount > 1) {
    text = 'Your focus felt particularly clear today.';
  } else if (scatteredCount > clearCount && scatteredCount > 1) {
    text = 'Your mind wandered a bit more today. That\'s okay.';
  } else if (morningCount >= todayMoments.length / 2 && morningCount > 1) {
    text = 'You found your focus early today.';
  } else if (eveningCount >= todayMoments.length / 2 && eveningCount > 1) {
    text = 'The evening brought your deepest focus.';
  } else if (todayMinutes > yesterdayMinutes && yesterdayMinutes > 0) {
    text = 'You sat a little longer today than yesterday.';
  } else if (todayMoments.length >= 3) {
    text = 'You returned to focus several times today.';
  } else {
    text = 'You showed up today. That matters.';
  }

  return {
    type: 'daily',
    text,
    generatedAt: new Date().toISOString(),
  };
}

export function generateWeeklyInsight(moments: Moment[]): PatternInsight | null {
  const now = new Date();
  const weekStart = getStartOfWeek(now);
  const weekMoments = moments.filter(
    (m) => new Date(m.date) >= weekStart && m.completed
  );

  if (weekMoments.length < 3) {
    return null;
  }

  const stats = calculateStats(weekMoments);

  // Find dominant time of day
  const timeEntries = Object.entries(stats.timeOfDayDistribution) as [TimeOfDay, number][];
  const [dominantTime] = timeEntries.sort((a, b) => b[1] - a[1])[0];

  // Find dominant mood
  const moodEntries = Object.entries(stats.moodDistribution) as [MoodType, number][];
  const [dominantMood, moodCount] = moodEntries.sort((a, b) => b[1] - a[1])[0];

  let text = '';

  if (dominantTime === 'morning' && stats.timeOfDayDistribution.morning >= weekMoments.length / 2) {
    text = 'You tended to focus more clearly earlier in the day.';
  } else if (dominantTime === 'evening' && stats.timeOfDayDistribution.evening >= weekMoments.length / 2) {
    text = 'The quiet of evening suited your practice this week.';
  } else if (dominantMood === 'clear' && moodCount >= weekMoments.length / 2) {
    text = 'Clarity was a steady companion this week.';
  } else if (stats.deepestMoment >= 45) {
    text = `Your deepest moment this week reached ${stats.deepestMoment} minutes.`;
  } else if (weekMoments.length >= 10) {
    text = 'You returned to stillness often this week.';
  } else {
    const avgMinutes = Math.round(stats.totalMinutes / 7);
    if (avgMinutes > 0) {
      text = `You averaged about ${avgMinutes} minutes of focus each day.`;
    } else {
      text = 'Patterns will emerge with time.';
    }
  }

  return {
    type: 'weekly',
    text,
    generatedAt: new Date().toISOString(),
  };
}

// Day names for charts
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Time of day labels
export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};
