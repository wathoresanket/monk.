import { SessionType, SESSION_TYPE_LABELS } from '@/types/monk';
import { cn } from '@/lib/utils';

interface SessionTypeSelectorProps {
  currentType: SessionType;
  onTypeChange: (type: SessionType) => void;
  disabled?: boolean;
}

const SESSION_TYPES: SessionType[] = ['focus', 'short-break', 'long-break'];

export function SessionTypeSelector({
  currentType,
  onTypeChange,
  disabled = false,
}: SessionTypeSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {SESSION_TYPES.map((type) => (
        <button
          key={type}
          onClick={() => onTypeChange(type)}
          disabled={disabled}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-400 ease-monk-gentle",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            currentType === type
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {SESSION_TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  );
}
