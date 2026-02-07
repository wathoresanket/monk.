import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="text-center max-w-md animate-monk-fade-in">
        <h1 className="monk-display text-foreground mb-4">Lost in stillness</h1>
        <p className="monk-body text-muted-foreground mb-8">
          This page doesn't exist. Let's return to focus.
        </p>
        <Link
          to="/"
          className={cn(
            "inline-flex items-center gap-2 px-6 py-3 rounded-lg",
            "bg-primary text-primary-foreground",
            "transition-all duration-400 ease-monk-gentle",
            "hover:opacity-90 active:scale-95"
          )}
        >
          <Home className="w-4 h-4" />
          Return to Monk.
        </Link>
      </div>
    </div>
  );
}
