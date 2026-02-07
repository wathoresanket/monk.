import { useState, useEffect } from 'react';
import { Sun, Cloud, Wind } from 'lucide-react';
import { MoodType, Moment, MOOD_LABELS } from '@/types/monk';
import { cn } from '@/lib/utils';
import { MonkLogo } from '@/components/common/MonkLogo';

interface SessionReflectionProps {
  moment: Moment;
  reduceMotion?: boolean;
  onComplete: (mood: MoodType) => void;
}

export function SessionReflection({ moment, reduceMotion = false, onComplete }: SessionReflectionProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);

    // Trigger exit animation after selection feedback
    setTimeout(() => {
      setIsExiting(true);

      // Complete after animation
      setTimeout(() => {
        onComplete(mood);
      }, 600); // Match ease-monk-gentle duration roughly
    }, 400); // Short delay to see selection state
  };

  const moods: MoodType[] = ['clear', 'neutral', 'scattered'];

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background",
        !reduceMotion && "transition-all duration-800 ease-monk-gentle",
        reduceMotion && "transition-opacity duration-300",
        isVisible && !isExiting ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-12 max-w-md px-8",
          !reduceMotion && "transition-all duration-800 ease-monk-gentle transform",
          reduceMotion && "transition-opacity duration-300",
          // Entrance
          !isVisible && (!reduceMotion ? "translate-y-4 opacity-0" : "opacity-0"),
          // Active
          isVisible && !isExiting && (!reduceMotion ? "translate-y-0 opacity-100" : "opacity-100"),
          // Exit
          isExiting && (!reduceMotion ? "-translate-y-8 opacity-0" : "opacity-0")
        )}
        style={{ transitionDelay: isVisible && !isExiting ? '200ms' : '0ms' }}
      >
        {/* Completion message */}
        <div className="text-center space-y-6">
          <div className="animate-monk-fade-in">
            <MonkLogo className="w-24 h-24 mx-auto" />
          </div>
          <div className="space-y-2">
            <h2 className="monk-display text-3xl md:text-4xl text-foreground font-medium tracking-tight">
              Moment complete
            </h2>
            <p className="monk-body text-muted-foreground">
              Thank you for being here.
            </p>
          </div>
        </div>

        {/* Mood question */}
        <div className="text-center space-y-8 w-full max-w-sm">
          <p className="monk-caption text-base uppercase tracking-widest opacity-60">
            How did it feel?
          </p>

          {/* Mood options */}
          <div className="grid grid-cols-1 gap-4">
            {moods.map((mood) => {
              const Icon = {
                clear: Sun,
                neutral: Cloud,
                scattered: Wind,
              }[mood];

              return (
                <button
                  key={mood}
                  onClick={() => handleMoodSelect(mood)}
                  disabled={selectedMood !== null}
                  className={cn(
                    "w-full py-4 px-6 rounded-xl text-center flex items-center justify-center gap-3",
                    "transition-all duration-400 ease-monk-gentle",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    selectedMood === mood
                      ? "bg-primary text-primary-foreground scale-[1.02]"
                      : selectedMood !== null
                        ? "bg-secondary/50 text-muted-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  <Icon className={cn("w-5 h-5", selectedMood === mood ? "opacity-100" : "opacity-70")} />
                  <span className="monk-body font-medium text-lg">
                    {MOOD_LABELS[mood]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
