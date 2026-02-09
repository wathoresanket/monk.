import { useState, useCallback, useEffect } from 'react';
import { Settings, BookOpen } from 'lucide-react';
import { useMonk } from '@/contexts/MonkContext';
import { useTimer } from '@/hooks/useTimer';
import { useAudio } from '@/hooks/useAudio';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useCursorAutoHide } from '@/hooks/useCursorAutoHide';
import { Moment, MoodType } from '@/types/monk';
import {
  CircularTimer,
  SessionTypeSelector,
  TimerControls,
  BreathingTransition,
  SoundToggle,
} from '@/components/timer';
import { SessionReflection } from '@/components/reflection';
import { MonkLogo } from '@/components/common/MonkLogo';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface TimerScreenProps {
  isSettingsOpen: boolean;
  isReflectionsOpen: boolean;
  onToggleSettings: () => void;
  onToggleReflections: () => void;
}

export function TimerScreen({
  isSettingsOpen,
  isReflectionsOpen,
  onToggleSettings,
  onToggleReflections
}: TimerScreenProps) {
  const { settings, addMoment, updateSettings, customAudioUrl, moments } = useMonk();
  const [showBreathing, setShowBreathing] = useState(false);
  const [pendingStart, setPendingStart] = useState(false);
  const [completedMoment, setCompletedMoment] = useState<Moment | null>(null);

  const audioControls = useAudio(settings.sound, customAudioUrl);


  // Sync audio playback with enabled setting
  useEffect(() => {
    if (settings.sound.enabled && !audioControls.isPlaying) {
      audioControls.play();
    } else if (!settings.sound.enabled && audioControls.isPlaying) {
      audioControls.stop();
    }
  }, [settings.sound.enabled, audioControls.isPlaying, audioControls.play, audioControls.stop, audioControls]);

  const toggleMute = useCallback(() => {
    // Attempt to handle interaction if possible
    audioControls.handleUserInteraction();
    updateSettings({
      sound: { ...settings.sound, enabled: !settings.sound.enabled }
    });
  }, [settings.sound, updateSettings, audioControls]);

  const handleSessionComplete = useCallback((moment: Moment) => {
    if (settings.reflectionPromptEnabled && moment.type === 'focus' && moment.duration > 0) {
      setCompletedMoment(moment);
    } else {
      // For breaks, zero-duration sessions, or if reflections are disabled
      addMoment(moment);
    }
    audioControls.stopOnSession();
    audioControls.playBell();
  }, [addMoment, audioControls, settings.reflectionPromptEnabled]);

  const handleSessionStart = useCallback(() => {
    audioControls.startOnSession();
  }, [audioControls]);

  const timer = useTimer({
    settings: settings.timer,
    onSessionComplete: handleSessionComplete,
    onSessionStart: handleSessionStart,
  });

  // Update document title
  useEffect(() => {
    if (timer.state.isRunning || timer.state.isPaused) {
      const minutes = Math.floor(timer.state.timeRemaining / 60);
      const seconds = timer.state.timeRemaining % 60;
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      const typeLabel = timer.state.currentType === 'focus' ? 'Focus' :
        timer.state.currentType === 'short-break' ? 'Short Break' : 'Long Break';
      document.title = `${timeString} - ${typeLabel}`;
    } else {
      document.title = 'Monk.';
    }

    return () => {
      document.title = 'Monk.';
    };
  }, [timer.state.timeRemaining, timer.state.isRunning, timer.state.isPaused, timer.state.currentType]);

  // Handle start with optional breathing transition
  const handleStart = useCallback(() => {
    audioControls.handleUserInteraction();

    if (settings.breathingAnimationEnabled && timer.state.currentType === 'focus') {
      setShowBreathing(true);
      setPendingStart(true);
    } else {
      timer.start();
    }
  }, [settings.breathingAnimationEnabled, timer, audioControls]);

  const handleBreathingComplete = useCallback(() => {
    setShowBreathing(false);
    if (pendingStart) {
      setPendingStart(false);
      timer.start();
    }
  }, [pendingStart, timer]);

  // Handle reflection completion
  const handleReflectionComplete = useCallback((mood: MoodType) => {
    if (completedMoment) {
      const momentWithMood: Moment = { ...completedMoment, mood };
      addMoment(momentWithMood);
      setCompletedMoment(null);
    }
  }, [completedMoment, addMoment]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onStartPause: () => {
      // If a modal is open, space shouldn't start timer probably? 
      // User didn't specify, but safer to only start if on timer screen.
      // But user wants R/S to toggle.
      if (isSettingsOpen || isReflectionsOpen) return;

      if (!timer.state.isRunning && !timer.state.isPaused) {
        handleStart();
      } else if (timer.state.isRunning) {
        timer.pause();
      } else if (timer.state.isPaused) {
        timer.resume();
      }
    },
    onStop: timer.stop,
    onSettings: onToggleSettings,
    onReflections: onToggleReflections,
    onSoundToggle: toggleMute,
  });

  // Auto-hide cursor when timer is running and no modals are open
  useCursorAutoHide(timer.state.isRunning && !isSettingsOpen && !isReflectionsOpen);

  // Show reflection screen
  if (completedMoment) {
    return (
      <SessionReflection
        moment={completedMoment}
        reduceMotion={settings.reduceMotion}
        onComplete={handleReflectionComplete}
      />
    );
  }

  const isActive = timer.state.isRunning || timer.state.isPaused;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 no-select">
      {/* Breathing transition overlay */}
      <BreathingTransition
        isActive={showBreathing}
        onComplete={handleBreathingComplete}
        reduceMotion={settings.reduceMotion}
      />

      {/* Header */}
      <header data-tauri-drag-region className="fixed top-0 left-0 right-0 flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <MonkLogo className="w-8 h-8" />
          <h1 className="monk-heading text-foreground">Monk.</h1>
        </div>

        <div className="flex items-center gap-2">
          <SoundToggle
            isPlaying={audioControls.isPlaying}
            enabled={settings.sound.enabled}
            onToggle={toggleMute}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleReflections}
                className={cn(
                  "p-2 rounded-lg transition-all duration-400 ease-monk-gentle active:scale-95",
                  "text-muted-foreground hover:text-foreground",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isReflectionsOpen && "text-foreground bg-secondary"
                )}
              >
                <BookOpen className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Reflections (R)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleSettings}
                className={cn(
                  "p-2 rounded-lg transition-all duration-400 ease-monk-gentle active:scale-95",
                  "text-muted-foreground hover:text-foreground",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isSettingsOpen && "text-foreground bg-secondary"
                )}
              >
                <Settings className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Settings (S)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* Main content */}
      {/* Main content */}
      <main className="flex flex-col items-center gap-6 md:gap-12 w-full max-w-lg mx-auto z-10 pb-20 md:pb-0">
        {/* Session type selector - hidden when active */}
        <div
          className={cn(
            "transition-all duration-600 ease-monk-gentle transform",
            !settings.reduceMotion && (isActive ? "opacity-0 -translate-y-8" : "translate-y-0"),
            settings.reduceMotion && (isActive ? "opacity-0" : "opacity-100"),
            isActive ? "pointer-events-none" : "opacity-100"
          )}
        >
          <SessionTypeSelector
            currentType={timer.state.currentType}
            onTypeChange={timer.setSessionType}
            disabled={isActive}
          />
        </div>

        {/* Timer */}
        <CircularTimer
          timeRemaining={timer.state.timeRemaining}
          totalTime={timer.state.totalTime}
          progress={timer.progress}
          isRunning={timer.state.isRunning}
          isPaused={timer.state.isPaused}
        />

        {/* Controls */}
        <TimerControls
          isRunning={timer.state.isRunning}
          isPaused={timer.state.isPaused}
          deepModeLocked={timer.state.deepModeLocked}
          onStart={handleStart}
          onPause={timer.pause}
          onResume={timer.resume}
          onStop={timer.stop}
          reduceMotion={settings.reduceMotion}
        />

        {/* Deep mode indicator */}
        {timer.state.deepModeLocked && (
          <p className={cn(
            "monk-caption",
            !settings.reduceMotion && "animate-monk-fade-in"
          )}>
            Deep mode — focus for a bit longer
          </p>
        )}
      </main>

      {/* Footer hint */}
      <footer className="fixed bottom-4 md:bottom-6 left-0 right-0 text-center space-y-1 vector-effect-non-scaling-stroke pointer-events-none z-20">
        <p className="monk-caption text-[9px] md:text-[10px] tracking-widest uppercase opacity-40 pt-2 md:pt-4">
          Made by Sanket
        </p>
      </footer>
    </div>
  );
}
