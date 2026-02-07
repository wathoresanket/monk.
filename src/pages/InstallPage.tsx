import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Check, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <Link
          to="/"
          className={cn(
            "inline-flex items-center gap-2 mb-12",
            "text-muted-foreground hover:text-foreground",
            "transition-all duration-400 ease-monk-gentle"
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Monk.
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="monk-display text-foreground mb-4">Install Monk.</h1>
          <p className="monk-body text-muted-foreground">
            Add Monk. to your dock for a focused, distraction-free experience.
          </p>
        </div>

        {/* Install status */}
        {isInstalled ? (
          <div className="text-center p-8 rounded-xl bg-card border border-border animate-monk-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h2 className="monk-heading text-foreground mb-2">Already Installed</h2>
            <p className="monk-caption">
              Monk. is ready in your dock. Open it anytime.
            </p>
          </div>
        ) : deferredPrompt ? (
          <div className="text-center">
            <button
              onClick={handleInstall}
              className={cn(
                "inline-flex items-center gap-3 px-8 py-4 rounded-xl",
                "bg-primary text-primary-foreground",
                "transition-all duration-400 ease-monk-gentle",
                "hover:opacity-90 active:scale-95"
              )}
            >
              <Download className="w-5 h-5" />
              Install Monk.
            </button>
          </div>
        ) : isIOS ? (
          <div className="space-y-6 animate-monk-fade-in">
            <div className="p-6 rounded-xl bg-card border border-border">
              <h2 className="monk-heading text-foreground mb-4">Install on iOS</h2>
              <ol className="space-y-4 monk-body text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-medium">1.</span>
                  Tap the Share button in Safari
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-medium">2.</span>
                  Scroll down and tap "Add to Home Screen"
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-medium">3.</span>
                  Tap "Add" to confirm
                </li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-monk-fade-in">
            <div className="p-6 rounded-xl bg-card border border-border">
              <h2 className="monk-heading text-foreground mb-4">Install on Desktop</h2>
              <ol className="space-y-4 monk-body text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-medium">1.</span>
                  Look for the install icon in your browser's address bar
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-medium">2.</span>
                  Click "Install" when prompted
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-medium">3.</span>
                  Monk. will appear in your dock
                </li>
              </ol>
            </div>
            <p className="monk-caption text-center">
              Using Chrome, Edge, or Safari for the best experience.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-16 space-y-6">
          <h2 className="monk-heading text-foreground text-center">Why Install?</h2>
          <div className="grid gap-4">
            <FeatureCard
              title="Works Offline"
              description="Focus without an internet connection"
            />
            <FeatureCard
              title="Quick Access"
              description="Launch from your dock like any app"
            />
            <FeatureCard
              title="Full Screen"
              description="No browser distractions"
            />
            <FeatureCard
              title="Private"
              description="All data stays on your device"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 rounded-lg bg-card border border-border">
      <h3 className="monk-body font-medium text-foreground">{title}</h3>
      <p className="monk-caption mt-1">{description}</p>
    </div>
  );
}
