import { Play, Pause, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  deepModeLocked: boolean;
  reduceMotion?: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function TimerControls({
  isRunning,
  isPaused,
  deepModeLocked,
  reduceMotion = false,
  onStart,
  onPause,
  onResume,
  onStop,
}: TimerControlsProps) {
  const handlePrimaryClick = () => {
    if (!isRunning && !isPaused) {
      onStart();
    } else if (isRunning) {
      onPause();
    } else if (isPaused) {
      onResume();
    }
  };

  const showStopButton = isRunning || isPaused;
  const canPause = isRunning && !deepModeLocked;

  return (
    <div className="flex items-center justify-center gap-2 h-16">
      {/* Primary action button */}
      <button
        onClick={handlePrimaryClick}
        disabled={isRunning && deepModeLocked}
        className={cn(
          "h-16 rounded-full flex items-center justify-center",
          !reduceMotion && "transition-all duration-500 ease-monk-gentle",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4",
          // Width adjustments for visual balance
          showStopButton ? "w-16" : "w-16",
          isRunning && !canPause
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
        )}
        title={
          !isRunning && !isPaused
            ? "Start (Space)"
            : isRunning
              ? deepModeLocked
                ? "Deep mode active"
                : "Pause (Space)"
              : "Resume (Space)"
        }
      >
        <div className="relative w-6 h-6">
          <Pause
            className={cn(
              "absolute inset-0 w-6 h-6",
              !reduceMotion && "transition-all duration-300",
              isRunning ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
            )}
          />
          <Play
            className={cn(
              "absolute inset-0 w-6 h-6 ml-0.5",
              !reduceMotion && "transition-all duration-300",
              !isRunning ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"
            )}
          />
        </div>
      </button>

      {/* Stop button wrapper for sliding animation */}
      <div
        className={cn(
          "overflow-hidden flex items-center",
          !reduceMotion && "transition-all duration-500 ease-monk-gentle",
          showStopButton ? "w-16 opacity-100 ml-2" : "w-0 opacity-0 ml-0"
        )}
      >
        <button
          onClick={onStop}
          // Only enable pointer events when fully visible to prevent accidental clicks during anim
          disabled={!showStopButton}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center min-w-[4rem]", // Fixed size inner
            "bg-secondary text-secondary-foreground",
            !reduceMotion && "transition-transform duration-300 hover:scale-105 active:scale-95",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          title="Stop (Escape)"
        >
          <Square className="w-5 h-5 fill-current" />
        </button>
      </div>
    </div>
  );
}
