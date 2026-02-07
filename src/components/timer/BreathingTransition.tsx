import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface BreathingTransitionProps {
  isActive: boolean;
  onComplete: () => void;
  duration?: number; // in milliseconds
  reduceMotion?: boolean;
}

type AnimationPhase = 'inhale-in' | 'transition' | 'exhale-out' | null;

export function BreathingTransition({
  isActive,
  onComplete,
  duration = 3000,
  reduceMotion = false,
}: BreathingTransitionProps) {
  const [phase, setPhase] = useState<AnimationPhase>(null);

  useEffect(() => {
    if (!isActive) {
      setPhase(null);
      return;
    }

    // Timeline (assuming 3000ms total):
    // 0ms: Inhale enters
    // 1300ms: Inhale exits / Exhale enters (Overlap)
    // 2600ms: Exhale exits
    // 3000ms: Done

    setPhase('inhale-in');

    const transitionTimer = setTimeout(() => {
      setPhase('transition');
    }, 1300);

    const exitTimer = setTimeout(() => {
      setPhase('exhale-out');
    }, 2400); // Give exhale enough time to be read before exiting

    const completeTimer = setTimeout(() => {
      setPhase(null);
      onComplete();
    }, duration);

    return () => {
      clearTimeout(transitionTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [isActive, duration, onComplete]);

  if (!isActive || !phase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent pointer-events-none">
      <div className="relative text-center z-10 flex flex-col items-center justify-center h-40 w-full mt-20">

        {/* Inhale Text */}
        <h2
          className={cn(
            "monk-display text-lg tracking-widest text-foreground absolute font-medium",
            !reduceMotion && phase === 'inhale-in' && "animate-monk-fade-in",
            !reduceMotion && phase === 'transition' && "animate-monk-fade-out",
            // Simple fade for reduced motion
            reduceMotion && (phase === 'inhale-in' ? "opacity-100 transition-opacity duration-1000" : "opacity-0 transition-opacity duration-1000"),
            (phase === 'exhale-out') && "opacity-0" // Ensure it stays hidden
          )}
        >
          Inhale
        </h2>

        {/* Exhale Text */}
        <h2
          className={cn(
            "monk-display text-lg tracking-widest text-foreground absolute font-medium opacity-0", // Start hidden
            !reduceMotion && phase === 'transition' && "animate-monk-fade-in", // Fade in while Inhale fades out
            !reduceMotion && phase === 'exhale-out' && "animate-monk-fade-out",
            // Simple fade for reduced motion
            reduceMotion && (phase !== 'inhale-in' ? "opacity-100 transition-opacity duration-1000" : "opacity-0 transition-opacity duration-1000")
          )}
        >
          Exhale
        </h2>
      </div>
    </div>
  );
}
