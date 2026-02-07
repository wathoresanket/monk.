import { useState, useCallback, useEffect } from 'react';
import { Settings, BookOpen } from 'lucide-react';
import { useMonk } from '@/contexts/MonkContext';
import { useTimer } from '@/hooks/useTimer';
import { useAudio } from '@/hooks/useAudio';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
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
import { cn } from '@/lib/utils';

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
  const { settings, addMoment, updateSettings } = useMonk();
  const [showBreathing, setShowBreathing] = useState(false);
  const [pendingStart, setPendingStart] = useState(false);
  const [completedMoment, setCompletedMoment] = useState<Moment | null>(null);

  const audioControls = useAudio(settings.sound);

  // Sync audio playback with enabled setting
  useEffect(() => {
    if (settings.sound.enabled && !audioControls.isPlaying) {
      audioControls.play();
    } else if (!settings.sound.enabled && audioControls.isPlaying) {
      audioControls.stop();
    }
  }, [settings.sound.enabled, audioControls.isPlaying]);

  const toggleMute = useCallback(() => {
    // Attempt to handle interaction if possible
    audioControls.handleUserInteraction();
    updateSettings({
      sound: { ...settings.sound, enabled: !settings.sound.enabled }
    });
  }, [settings.sound, updateSettings, audioControls]);

  const handleSessionComplete = useCallback((moment: Moment) => {
    // Show reflection if enabled AND it's a focus session with duration
    if (settings.reflectionPromptEnabled && moment.type === 'focus' && moment.duration > 0) {
      setCompletedMoment(moment);
    } else {
      // For breaks, zero-duration sessions, or if reflections are disabled
      addMoment(moment);
    }
    audioControls.stopOnSession();
  }, [addMoment, audioControls, settings.reflectionPromptEnabled]);

  const handleSessionStart = useCallback(() => {
    audioControls.startOnSession();
  }, [audioControls]);

  const timer = useTimer({
    settings: settings.timer,
    onSessionComplete: handleSessionComplete,
    onSessionStart: handleSessionStart,
  });

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

          <button
            onClick={onToggleReflections}
            className={cn(
              "p-2 rounded-lg transition-all duration-400 ease-monk-gentle",
              "text-muted-foreground hover:text-foreground",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isReflectionsOpen && "text-foreground bg-secondary"
            )}
            title="Reflections (R)"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleSettings}
            className={cn(
              "p-2 rounded-lg transition-all duration-400 ease-monk-gentle",
              "text-muted-foreground hover:text-foreground",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isSettingsOpen && "text-foreground bg-secondary"
            )}
            title="Settings (S)"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-col items-center gap-12">
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
      <footer className="fixed bottom-6 left-0 right-0 text-center space-y-2 pointer-events-none">
        <div className="flex items-center justify-center gap-4 opacity-50 hover:opacity-100 transition-opacity duration-500">
          <div className="flex items-center gap-2">
            <span className="border border-foreground/20 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-medium">Space</span>
            <span className="text-[10px] tracking-wide">{isActive ? (timer.state.isRunning ? 'pause' : 'resume') : 'start'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="border border-foreground/20 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-medium">R</span>
            <span className="text-[10px] tracking-wide">reflections</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="border border-foreground/20 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-medium">S</span>
            <span className="text-[10px] tracking-wide">settings</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="border border-foreground/20 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-medium">M</span>
            <span className="text-[10px] tracking-wide">mute</span>
          </div>
        </div>
        <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground opacity-80 pt-2">
          Made by Sanket
        </p>
      </footer>
    </div>
  );
}
