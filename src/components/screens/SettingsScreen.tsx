import { useState } from 'react';
import { X, Download, Trash2 } from 'lucide-react';
import { useMonk } from '@/contexts/MonkContext';
import { SoundType } from '@/types/monk';
import { exportMomentsToCSV, exportMomentsToPDF } from '@/lib/database';
import { cn } from '@/lib/utils';

interface SettingsScreenProps {
  onClose: () => void;
}

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const { settings, updateSettings, clearMoments, clearAll, moments } = useMonk();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  const handleTimerChange = (key: string, value: number | boolean) => {
    updateSettings({
      timer: { ...settings.timer, [key]: value },
    });
  };

  const handleSoundChange = (key: string, value: string | number | boolean) => {
    updateSettings({
      sound: { ...settings.sound, [key]: value },
    });
  };

  const handleExportCSV = async () => {
    const csv = await exportMomentsToCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monk-journal-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    const blob = await exportMomentsToPDF();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monk-journal-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearMoments = async () => {
    await clearMoments();
    setShowClearConfirm(false);
  };

  const handleClearAll = async () => {
    await clearAll();
    setShowClearAllConfirm(false);
  };



  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="min-h-screen max-w-lg mx-auto p-8">
        {/* Header */}
        <header data-tauri-drag-region className="flex items-center justify-between mb-12">
          <h1 className="monk-title text-foreground">Settings</h1>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-lg transition-all duration-400 ease-monk-gentle",
              "text-muted-foreground hover:text-foreground",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Settings sections */}
        <div className="space-y-12">
          {/* Timer */}
          <section className="space-y-6">
            <h2 className="monk-caption text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 pl-1">Timer</h2>

            <div className="space-y-4">
              <SettingRow label="Focus duration">
                <DurationInput
                  value={settings.timer.focusDuration}
                  onChange={(v) => handleTimerChange('focusDuration', v)}
                  min={5}
                  max={120}
                />
              </SettingRow>

              <SettingRow label="Short break">
                <DurationInput
                  value={settings.timer.shortBreakDuration}
                  onChange={(v) => handleTimerChange('shortBreakDuration', v)}
                  min={1}
                  max={30}
                />
              </SettingRow>

              <SettingRow label="Long break">
                <DurationInput
                  value={settings.timer.longBreakDuration}
                  onChange={(v) => handleTimerChange('longBreakDuration', v)}
                  min={5}
                  max={60}
                />
              </SettingRow>

              <SettingRow label="Deep mode">
                <Toggle
                  checked={settings.timer.deepModeEnabled}
                  onChange={(v) => handleTimerChange('deepModeEnabled', v)}
                />
              </SettingRow>

              {settings.timer.deepModeEnabled && (
                <SettingRow label="Deep mode minutes">
                  <DurationInput
                    value={settings.timer.deepModeMinutes}
                    onChange={(v) => handleTimerChange('deepModeMinutes', v)}
                    min={1}
                    max={15}
                  />
                </SettingRow>
              )}
            </div>
          </section>

          {/* Sound */}
          <section className="space-y-6">
            <h2 className="monk-caption text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 pl-1">Sound</h2>

            <div className="space-y-4">
              <SettingRow label="Tibetan Mountain">
                <Toggle
                  checked={settings.sound.enabled}
                  onChange={(v) => handleSoundChange('enabled', v)}
                />
              </SettingRow>

              {settings.sound.enabled && (
                <>
                  <SettingRow label="Volume">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.sound.volume}
                      onChange={(e) => handleSoundChange('volume', parseFloat(e.target.value))}
                      className="w-32 accent-primary"
                    />
                  </SettingRow>

                  <SettingRow label="Auto-start with focus">
                    <Toggle
                      checked={settings.sound.autoStart}
                      onChange={(v) => handleSoundChange('autoStart', v)}
                    />
                  </SettingRow>
                </>
              )}
            </div>
          </section>

          {/* Reflections */}
          <section className="space-y-6">
            <h2 className="monk-caption text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 pl-1">Reflections</h2>

            <div className="space-y-4">
              <SettingRow label="Journaling prompt">
                <Toggle
                  checked={settings.reflectionPromptEnabled}
                  onChange={(v) => updateSettings({ reflectionPromptEnabled: v })}
                />
              </SettingRow>
            </div>
          </section>

          {/* Appearance */}
          <section className="space-y-6">
            <h2 className="monk-caption text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 pl-1">Appearance</h2>

            <div className="space-y-4">
              <SettingRow label="Reduce motion">
                <Toggle
                  checked={settings.reduceMotion}
                  onChange={(v) => updateSettings({ reduceMotion: v })}
                />
              </SettingRow>

              <SettingRow label="Opening breath">
                <Toggle
                  checked={settings.breathingAnimationEnabled}
                  onChange={(v) => updateSettings({ breathingAnimationEnabled: v })}
                />
              </SettingRow>
            </div>
          </section>

          {/* Data */}
          <section className="space-y-6">
            <h2 className="monk-caption text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 pl-1">Data</h2>

            <div className="p-2 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="monk-body font-medium">Your History</h3>
                  <p className="monk-caption text-xs">
                    {moments.length} moment{moments.length !== 1 ? 's' : ''} recorded
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExportCSV}
                  disabled={moments.length === 0}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg",
                    "bg-secondary text-secondary-foreground",
                    "transition-all duration-400 ease-monk-gentle",
                    "hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>

                <button
                  onClick={handleExportPDF}
                  disabled={moments.length === 0}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg",
                    "bg-secondary text-secondary-foreground",
                    "transition-all duration-400 ease-monk-gentle",
                    "hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <Download className="w-4 h-4" />
                  Export Journal
                </button>
              </div>

              <div className="pt-4 space-y-3">
                {!showClearConfirm ? (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    disabled={moments.length === 0}
                    className={cn(
                      "flex items-center gap-2 text-muted-foreground",
                      "transition-all duration-400 ease-monk-gentle",
                      "hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear all moments
                  </button>
                ) : (
                  <div className="flex items-center gap-3 animate-monk-fade-in">
                    <span className="monk-caption">Are you sure?</span>
                    <button
                      onClick={handleClearMoments}
                      className="text-destructive hover:underline"
                    >
                      Yes, clear
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="text-muted-foreground hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {!showClearAllConfirm ? (
                  <button
                    onClick={() => setShowClearAllConfirm(true)}
                    className={cn(
                      "flex items-center gap-2 text-muted-foreground",
                      "transition-all duration-400 ease-monk-gentle",
                      "hover:text-foreground"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                    Reset everything
                  </button>
                ) : (
                  <div className="flex items-center gap-3 animate-monk-fade-in">
                    <span className="monk-caption">This cannot be undone.</span>
                    <button
                      onClick={handleClearAll}
                      className="text-destructive hover:underline"
                    >
                      Reset all
                    </button>
                    <button
                      onClick={() => setShowClearAllConfirm(false)}
                      className="text-muted-foreground hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border text-center">
          <p className="monk-caption">Monk.</p>
          <p className="monk-caption mt-1 opacity-60">A personal focus journal</p>
        </footer>
      </div>
    </div>
  );
}

// Helper components
function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="monk-body text-foreground">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "w-12 h-7 rounded-full relative transition-all duration-400 ease-monk-gentle",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "absolute top-1 left-1 w-5 h-5 rounded-full bg-background",
          "transition-transform duration-400 ease-monk-gentle",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}

function DurationInput({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value);
          if (!isNaN(v) && v >= min && v <= max) {
            onChange(v);
          }
        }}
        min={min}
        max={max}
        className={cn(
          "w-16 px-3 py-1.5 rounded-lg text-center bg-secondary/50 text-foreground font-medium",
          "border border-transparent focus:bg-background focus:border-ring/20 focus:outline-none focus:ring-2 focus:ring-ring/20",
          "transition-all duration-400 ease-monk-gentle appearance-none"
        )}
      />
      <span className="monk-caption text-xs uppercase tracking-wider opacity-50">min</span>
    </div>
  );
}
