// Monk. Core Types

export type SessionType = 'focus' | 'short-break' | 'long-break';

export type MoodType = 'clear' | 'neutral' | 'scattered';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';
export const TIME_OF_DAY_VALUES: TimeOfDay[] = ['morning', 'afternoon', 'evening'];

export type SoundType = 'tibetan' | 'silence';

export type TimeScope = 'week' | 'month' | 'all';

export interface Moment {
  id: string;
  date: string; // ISO date string
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  duration: number; // in minutes (actual completed)
  plannedDuration: number; // in minutes (original target)
  type: SessionType;
  completed: boolean;
  mood?: MoodType;
  timeOfDay: TimeOfDay;
}

export interface TimerSettings {
  focusDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  deepModeEnabled: boolean;
  deepModeMinutes: number; // minutes before pause is allowed
}

export interface SoundSettings {
  enabled: boolean;
  type: SoundType;
  volume: number; // 0-1
  autoStart: boolean;
}

export interface AppSettings {
  timer: TimerSettings;
  sound: SoundSettings;
  reflectionPromptEnabled: boolean;
  reduceMotion: boolean;
  breathingAnimationEnabled: boolean;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentType: SessionType;
  timeRemaining: number; // in seconds
  totalTime: number; // in seconds
  sessionStartTime: string | null;
  deepModeLocked: boolean;
}

// Pattern insights generated locally
export interface PatternInsight {
  type: 'daily' | 'weekly';
  text: string;
  generatedAt: string;
}

// Stats computed from Moments
export interface MomentStats {
  totalMinutes: number;
  deepestMoment: number; // longest session in minutes
  momentCount: number;
  completedCount: number;
  averageDuration: number;
  moodDistribution: Record<MoodType, number>;
  timeOfDayDistribution: Record<TimeOfDay, number>;
  timeOfDayMinutes: Record<TimeOfDay, number>;
  dailyMinutes: Record<string, number>; // date -> minutes
}

// Default settings
export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  deepModeEnabled: false,
  deepModeMinutes: 5,
};

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  enabled: false,
  type: 'tibetan',
  volume: 0.5,
  autoStart: false,
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  timer: DEFAULT_TIMER_SETTINGS,
  sound: DEFAULT_SOUND_SETTINGS,
  reflectionPromptEnabled: true,
  reduceMotion: false,
  breathingAnimationEnabled: true,
};

export const SOUND_URLS: Record<SoundType, string> = {
  tibetan: '/sounds/tibetan-mountain-meditation.ogg?v=3',
  silence: '',
};

export const SOUND_LABELS: Record<SoundType, string> = {
  tibetan: 'Tibetan Mountain',
  silence: 'Silence',
};

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  focus: 'Focus',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
};

export const MOOD_LABELS: Record<MoodType, string> = {
  clear: 'Clear',
  neutral: 'Neutral',
  scattered: 'Scattered',
};
