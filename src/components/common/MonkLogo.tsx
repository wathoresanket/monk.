import { cn } from '@/lib/utils';

interface MonkLogoProps {
    className?: string;
    withText?: boolean;
}

export function MonkLogo({ className, withText = false }: MonkLogoProps) {
    return (
        <div className={cn("flex items-center gap-2 select-none", className)}>
            <div className="relative w-full h-full rounded-full bg-secondary/40 flex items-center justify-center shadow-inner">
                <div className="w-[30%] h-[30%] rounded-full bg-primary/30" />
            </div>
            {withText && (
                <span className="font-serif font-medium tracking-tight text-foreground">
                    Monk.
                </span>
            )}
        </div>
    );
}
