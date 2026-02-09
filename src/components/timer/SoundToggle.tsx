import { Volume2, VolumeX } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

interface SoundToggleProps {
  isPlaying: boolean;
  enabled: boolean;
  onToggle: () => void;
}

export function SoundToggle({ isPlaying, enabled, onToggle }: SoundToggleProps) {
  const tooltipText = isPlaying
    ? "Mute (M)"
    : enabled
      ? "Unmute (M)"
      : "Enable sound in settings";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onToggle}
          className={cn(
            "p-2 rounded-lg transition-all duration-400 ease-monk-gentle active:scale-95",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isPlaying
              ? "text-primary"
              : enabled
                ? "text-muted-foreground hover:text-foreground"
                : "text-muted-foreground/50 hover:text-muted-foreground"
          )}
        >
          {isPlaying || enabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
}
