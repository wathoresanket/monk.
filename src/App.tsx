import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react';
import { MonkProvider, useMonk } from '@/contexts/MonkContext';
import { TimerScreen, SettingsScreen, ReflectionsScreen } from '@/components/screens';
import InstallPage from './pages/InstallPage';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

type Screen = 'timer' | 'settings' | 'reflections';

function MonkApp() {
  const { isLoading } = useMonk();
  const [currentScreen, setCurrentScreen] = useState<Screen>('timer');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-monk-fade-in">
          <h1 className="monk-display text-foreground mb-4">Monk.</h1>
          <p className="monk-caption">Preparing your space...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TimerScreen
        isSettingsOpen={currentScreen === 'settings'}
        isReflectionsOpen={currentScreen === 'reflections'}
        onToggleSettings={() => setCurrentScreen(prev => prev === 'settings' ? 'timer' : 'settings')}
        onToggleReflections={() => setCurrentScreen(prev => prev === 'reflections' ? 'timer' : 'reflections')}
      />

      {currentScreen === 'settings' && (
        <SettingsScreen onClose={() => setCurrentScreen('timer')} />
      )}

      {currentScreen === 'reflections' && (
        <ReflectionsScreen onClose={() => setCurrentScreen('timer')} />
      )}
    </>
  );
}

function HomePage() {
  return (
    <MonkProvider>
      <MonkApp />
    </MonkProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner
        className="toaster group"
        toastOptions={{
          classNames: {
            toast: "group toast group-[.toaster]:bg-secondary group-[.toaster]:text-foreground group-[.toaster]:border-border/50 group-[.toaster]:shadow-lg monk-body",
            description: "group-[.toast]:text-muted-foreground monk-caption",
            actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
            cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
