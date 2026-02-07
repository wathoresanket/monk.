import { cn, formatTime } from '@/lib/utils';

interface CircularTimerProps {
  timeRemaining: number;
  totalTime: number;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
}

export function CircularTimer({
  timeRemaining,
  progress,
  isRunning,
  isPaused,
}: CircularTimerProps) {
  const size = 320;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center">
      {/* Background glow when running */}
      {isRunning && (
        <div
          className="absolute inset-0 rounded-full animate-monk-timer-pulse"
          style={{
            width: size,
            height: size,
          }}
        />
      )}

      {/* SVG Timer Ring Container - Handles breathing animation */}
      <div className={cn(
        "transition-all duration-1000 ease-monk-gentle",
        isRunning && "monk-breathe"
      )}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--monk-timer-bg))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--monk-timer-progress))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-monk-gentle"
            style={{
              opacity: progress > 0 ? 1 : 0.3,
            }}
          />
        </svg>
      </div>

      {/* Timer display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "monk-timer text-6xl text-foreground transition-opacity duration-600",
            isPaused && "opacity-60"
          )}
        >
          {formatTime(timeRemaining)}
        </span>

        {isPaused && (
          <span className="monk-caption mt-3 animate-monk-fade-in">
            Paused
          </span>
        )}
      </div>
    </div>
  );
}
