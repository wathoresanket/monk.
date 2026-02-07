import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SoundToggleProps {
  isPlaying: boolean;
  enabled: boolean;
  onToggle: () => void;
}

export function SoundToggle({ isPlaying, enabled, onToggle }: SoundToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "p-2 rounded-lg transition-all duration-400 ease-monk-gentle",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isPlaying
          ? "text-primary"
          : enabled
          ? "text-muted-foreground hover:text-foreground"
          : "text-muted-foreground/50 hover:text-muted-foreground"
      )}
      title={isPlaying ? "Stop sound (S)" : enabled ? "Play sound (S)" : "Enable sound in settings"}
    >
      {isPlaying ? (
        <Volume2 className="w-5 h-5" />
      ) : (
        <VolumeX className="w-5 h-5" />
      )}
    </button>
  );
}
