import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState, SessionType, Moment, TimerSettings } from '@/types/monk';
import { generateId } from '@/lib/database';
import { getTimeOfDay, getDateString } from '@/lib/utils';

interface UseTimerOptions {
  settings: TimerSettings;
  onSessionComplete: (moment: Moment) => void;
  onSessionStart?: () => void;
}

export function useTimer({ settings, onSessionComplete, onSessionStart }: UseTimerOptions) {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    currentType: 'focus',
    timeRemaining: settings.focusDuration * 60,
    totalTime: settings.focusDuration * 60,
    sessionStartTime: null,
    deepModeLocked: false,
  });

  const intervalRef = useRef<number | null>(null);
  const deepModeTimerRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const getDurationForType = useCallback((type: SessionType, s: TimerSettings): number => {
    switch (type) {
      case 'focus':
        return s.focusDuration;
      case 'short-break':
        return s.shortBreakDuration;
      case 'long-break':
        return s.longBreakDuration;
      default:
        return s.focusDuration;
    }
  }, []);

  // Update time when settings change (only when not running)
  useEffect(() => {
    if (!state.isRunning && !state.isPaused) {
      const duration = getDurationForType(state.currentType, settings);
      setState((prev) => ({
        ...prev,
        timeRemaining: duration * 60,
        totalTime: duration * 60,
      }));
    }
  }, [settings, state.currentType, state.isRunning, state.isPaused, getDurationForType]);



  const clearIntervals = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (deepModeTimerRef.current) {
      window.clearTimeout(deepModeTimerRef.current);
      deepModeTimerRef.current = null;
    }
  }, []);

  const completeSession = useCallback((completed: boolean) => {
    clearIntervals();

    const endTime = new Date().toISOString();
    const startTime = state.sessionStartTime || endTime;
    const plannedMinutes = state.totalTime / 60;

    // Calculate actual minutes focused (rounded)
    // If completed naturally: actual = planned
    // If interrupted: actual = planned - remaining
    const actualMinutes = completed
      ? plannedMinutes
      : Math.round(((state.totalTime - state.timeRemaining) / 60) * 10) / 10;

    const moment: Moment = {
      id: sessionIdRef.current || generateId(),
      date: getDateString(new Date(startTime)),
      startTime,
      endTime,
      duration: actualMinutes,
      plannedDuration: plannedMinutes,
      type: state.currentType,
      completed,
      timeOfDay: getTimeOfDay(new Date(startTime)),
    };

    sessionIdRef.current = null;

    setState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      sessionStartTime: null,
      deepModeLocked: false,
      timeRemaining: getDurationForType(prev.currentType, settings) * 60,
    }));

    onSessionComplete(moment);
  }, [state, settings, getDurationForType, clearIntervals, onSessionComplete]);

  const start = useCallback(() => {
    if (state.isRunning) return;

    const newSessionId = generateId();
    sessionIdRef.current = newSessionId;

    setState((prev) => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      sessionStartTime: new Date().toISOString(),
      deepModeLocked: settings.deepModeEnabled && prev.currentType === 'focus',
    }));

    onSessionStart?.();

    // Deep mode timer
    if (settings.deepModeEnabled && state.currentType === 'focus') {
      deepModeTimerRef.current = window.setTimeout(() => {
        setState((prev) => ({ ...prev, deepModeLocked: false }));
      }, settings.deepModeMinutes * 60 * 1000);
    }

    // Main countdown
    intervalRef.current = window.setInterval(() => {
      setState((prev) => {
        if (prev.timeRemaining <= 1) {
          // Session complete
          clearIntervals();
          return prev; // Will be handled by effect
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  }, [state.isRunning, state.currentType, settings, onSessionStart, clearIntervals]);

  // Watch for timer completion
  useEffect(() => {
    if (state.isRunning && state.timeRemaining <= 0) {
      completeSession(true);
    }
  }, [state.isRunning, state.timeRemaining, completeSession]);

  const pause = useCallback(() => {
    if (!state.isRunning || state.deepModeLocked) return;

    clearIntervals();
    setState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: true,
    }));
  }, [state.isRunning, state.deepModeLocked, clearIntervals]);

  const resume = useCallback(() => {
    if (!state.isPaused) return;

    setState((prev) => ({
      ...prev,
      isRunning: true,
      isPaused: false,
    }));

    intervalRef.current = window.setInterval(() => {
      setState((prev) => {
        if (prev.timeRemaining <= 1) {
          clearIntervals();
          return prev;
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  }, [state.isPaused, clearIntervals]);

  const stop = useCallback(() => {
    if (!state.isRunning && !state.isPaused) return;
    completeSession(false);
  }, [state.isRunning, state.isPaused, completeSession]);

  const reset = useCallback(() => {
    clearIntervals();
    sessionIdRef.current = null;

    setState((prev) => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      sessionStartTime: null,
      deepModeLocked: false,
      timeRemaining: getDurationForType(prev.currentType, settings) * 60,
      totalTime: getDurationForType(prev.currentType, settings) * 60,
    }));
  }, [settings, getDurationForType, clearIntervals]);

  const setSessionType = useCallback((type: SessionType) => {
    if (state.isRunning || state.isPaused) return;

    const duration = getDurationForType(type, settings);
    setState((prev) => ({
      ...prev,
      currentType: type,
      timeRemaining: duration * 60,
      totalTime: duration * 60,
    }));
  }, [state.isRunning, state.isPaused, settings, getDurationForType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearIntervals();
  }, [clearIntervals]);

  const progress = state.totalTime > 0
    ? (state.totalTime - state.timeRemaining) / state.totalTime
    : 0;

  return {
    state,
    progress,
    start,
    pause,
    resume,
    stop,
    reset,
    setSessionType,
  };
}
