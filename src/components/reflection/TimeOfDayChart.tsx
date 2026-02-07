
import { MomentStats, TimeOfDay, TimeScope } from '@/types/monk';
import { cn } from '@/lib/utils';
import { Sun, Sunset, Moon } from 'lucide-react';

interface TimeOfDayChartProps {
    stats: MomentStats;
    scope: TimeScope;
}

export function TimeOfDayChart({ stats, scope }: TimeOfDayChartProps) {
    const blocks = [
        { type: 'morning', icon: Sun, label: 'Morning', minutes: stats.timeOfDayMinutes.morning },
        { type: 'afternoon', icon: Sunset, label: 'Afternoon', minutes: stats.timeOfDayMinutes.afternoon },
        { type: 'evening', icon: Moon, label: 'Evening', minutes: stats.timeOfDayMinutes.evening },
    ] as const;

    return (
        <div className="grid grid-cols-3 gap-4">
            {blocks.map((block) => {
                // Show total minutes for the scope instead of average
                const minutes = Math.round(block.minutes);
                return (
                    <div key={block.type} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-muted/20">
                        <block.icon className="w-8 h-8 text-primary opacity-80" />

                        <div className="text-center">
                            <span className="block text-2xl font-serif font-medium text-foreground">
                                {minutes}m
                            </span>
                            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                                {block.label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
