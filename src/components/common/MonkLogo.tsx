import { cn } from '@/lib/utils';

interface MonkLogoProps {
    className?: string;
    withText?: boolean;
}

export function MonkLogo({ className, withText = false }: MonkLogoProps) {
    return (
        <div className={cn("flex items-center gap-2 select-none", className)}>
            <img
                src="/app-icon.png"
                alt="Monk Logo"
                className="w-full h-full object-contain"
            />
            {withText && (
                <span className="font-serif font-medium tracking-tight text-foreground">
                    Monk.
                </span>
            )}
        </div>
    );
}
