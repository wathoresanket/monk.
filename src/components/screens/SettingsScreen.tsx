import { useRef, useState } from 'react';
import { X, Download, Trash2, Upload, FileJson, Music, Clock, Volume2, Sparkles, Keyboard, Database } from 'lucide-react';
import { useMonk } from '@/contexts/MonkContext';
import { SoundType } from '@/types/monk';
import { exportMomentsToCSV, exportMomentsToPDF } from '@/lib/database';
import { exportData, importData } from '@/lib/backup';
import { cn } from '@/lib/utils';
import { audioManager } from '@/lib/audio';
import { toast } from 'sonner';

interface SettingsScreenProps {
  onClose: () => void;
}

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const { settings, updateSettings, clearMoments, clearAll, moments, uploadCustomAudio, customAudioUrl } = useMonk();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

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
    try {
      const csv = await exportMomentsToCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monk-journal-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Exported to CSV", { description: "Your journal history has been downloaded." });
    } catch (error) {
      toast.error("Export failed", { description: "Could not export data." });
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await exportMomentsToPDF();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monk-journal-${new Date().toISOString().split('T')[0]}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Exported to HTML", { description: "Your journal history has been downloaded." });
    } catch (error) {
      toast.error("Export failed", { description: "Could not export data." });
    }
  };

  const handleClearMoments = async () => {
    await clearMoments();
    setShowClearConfirm(false);
    toast("Moments cleared", { description: "All your history has been deleted." });
  };

  const handleClearAll = async () => {
    await clearAll();
    setShowClearAllConfirm(false);
    toast("App reset", { description: "All settings and data have been cleared." });
  };

  const handleBackupToFile = async () => {
    try {
      const json = await exportData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monk-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Backup complete", { description: "Your data has been saved to a file." });
    } catch (error) {
      console.error('Export failed', error);
      toast.error("Backup failed", { description: "Could not save backup file." });
    }
  };

  const handleImportFromFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm("Importing a backup will merge moments and overwrite your current settings. This cannot be undone. Are you sure?")) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      const text = await file.text();
      await importData(text);
      toast.success("Import successful", { description: "Reloading app..." });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Import failed', error);
      alert('Failed to import backup. The file might be corrupted or invalid.');
      toast.error("Import failed", { description: "The file might be corrupted or invalid." });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAudioUpload = () => {
    audioInputRef.current?.click();
  };

  const handleAudioFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) { // 15MB limit
      toast.error("File too large", { description: "Please upload a file smaller than 15MB." });
      if (audioInputRef.current) audioInputRef.current.value = '';
      return;
    }

    try {
      await uploadCustomAudio(file);
      toast("Audio uploaded", { description: "Custom sound is now ready to use." });
    } catch (error) {
      console.error('Audio upload failed', error);
      toast.error("Upload failed", { description: "Could not save audio file." });
    } finally {
      if (audioInputRef.current) audioInputRef.current.value = '';
    }
  };




  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto animate-monk-fade-in">
      <div className="min-h-screen max-w-lg mx-auto p-8">
        {/* Header */}
        <header data-tauri-drag-region className="flex items-center justify-between mb-12">
          <h1 className="monk-title text-foreground">Settings</h1>
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-full hover:bg-secondary/50 transition-all duration-400 ease-monk-gentle",
              "text-muted-foreground hover:text-foreground",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        {/* Settings sections */}
        <div className="space-y-12">
          {/* Timer */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-muted-foreground/70 pb-2 border-b border-border/40">
              <Clock className="w-4 h-4" />
              <h2 className="monk-caption text-xs font-semibold uppercase tracking-widest">Timer</h2>
            </div>

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
            <div className="flex items-center gap-2 text-muted-foreground/70 pb-2 border-b border-border/40">
              <Volume2 className="w-4 h-4" />
              <h2 className="monk-caption text-xs font-semibold uppercase tracking-widest">Sound</h2>
            </div>

            <div className="space-y-4">
              <SettingRow label="Background Sound">
                <div className="flex items-center gap-2">
                  <select
                    value={settings.sound.enabled ? settings.sound.type : 'silence'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'silence') {
                        handleSoundChange('enabled', false);
                      } else {
                        updateSettings({
                          sound: { ...settings.sound, enabled: true, type: val as SoundType }
                        });
                      }
                    }}
                    className={cn(
                      "bg-secondary/50 text-foreground text-sm rounded-lg px-3 py-1.5",
                      "border border-transparent focus:bg-background focus:border-ring/20 focus:outline-none focus:ring-2 focus:ring-ring/20",
                      "transition-all duration-400 ease-monk-gentle appearance-none cursor-pointer"
                    )}
                  >
                    <option value="silence">Silence</option>
                    <option value="tibetan">Default</option>
                    {customAudioUrl && <option value="custom">Custom</option>}
                  </select>
                </div>
              </SettingRow>

              <SettingRow label="Custom Audio">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAudioUpload}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm",
                      "bg-secondary text-secondary-foreground",
                      "transition-all duration-400 ease-monk-gentle",
                      "hover:bg-secondary/80"
                    )}
                  >
                    <Music className="w-3.5 h-3.5" />
                    {customAudioUrl ? 'Change File' : 'Upload File'}
                  </button>
                  <input
                    type="file"
                    ref={audioInputRef}
                    onChange={handleAudioFileChange}
                    accept="audio/*"
                    className="hidden"
                  />
                </div>
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

              <SettingRow label="Session End Bell">
                <Toggle
                  checked={settings.sound.bellEnabled}
                  onChange={(v) => handleSoundChange('bellEnabled', v)}
                />
              </SettingRow>

              {settings.sound.bellEnabled && (
                <SettingRow label="Bell Volume">
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.sound.bellVolume}
                      onChange={(e) => handleSoundChange('bellVolume', parseFloat(e.target.value))}
                      className="w-32 accent-primary"
                    />
                    <button
                      onClick={() => {
                        console.log('[Settings] Test bell clicked');
                        audioManager.playBell(Number(settings.sound.bellVolume));
                      }}
                      className="p-1 rounded hover:bg-muted text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                      title="Test Bell"
                    >
                      Test
                    </button>
                  </div>
                </SettingRow>
              )}
            </div>
          </section>

          {/* Reflections */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-muted-foreground/70 pb-2 border-b border-border/40">
              <Sparkles className="w-4 h-4" />
              <h2 className="monk-caption text-xs font-semibold uppercase tracking-widest">Reflections</h2>
            </div>

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
            <div className="flex items-center gap-2 text-muted-foreground/70 pb-2 border-b border-border/40">
              <Sparkles className="w-4 h-4" />
              <h2 className="monk-caption text-xs font-semibold uppercase tracking-widest">Appearance</h2>
            </div>

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

          {/* Keyboard Shortcuts */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-muted-foreground/70 pb-2 border-b border-border/40">
              <Keyboard className="w-4 h-4" />
              <h2 className="monk-caption text-xs font-semibold uppercase tracking-widest">Keyboard</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Start / Pause</span>
                <kbd className="px-2 py-1 bg-secondary rounded text-xs text-secondary-foreground font-mono">Space</kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Stop Session</span>
                <kbd className="px-2 py-1 bg-secondary rounded text-xs text-secondary-foreground font-mono">Esc</kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Toggle Settings</span>
                <kbd className="px-2 py-1 bg-secondary rounded text-xs text-secondary-foreground font-mono">S</kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reflections</span>
                <kbd className="px-2 py-1 bg-secondary rounded text-xs text-secondary-foreground font-mono">R</kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Toggle Mute</span>
                <kbd className="px-2 py-1 bg-secondary rounded text-xs text-secondary-foreground font-mono">M</kbd>
              </div>
            </div>
          </section>

          {/* Data */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-muted-foreground/70 pb-2 border-b border-border/40">
              <Database className="w-4 h-4" />
              <h2 className="monk-caption text-xs font-semibold uppercase tracking-widest">Data</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="monk-body font-medium">Your History</h3>
                  <p className="monk-caption text-xs">
                    {moments.length} moment{moments.length !== 1 ? 's' : ''} recorded
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleBackupToFile}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
                    "bg-secondary/50 text-secondary-foreground text-sm font-medium",
                    "border border-transparent hover:bg-secondary hover:border-border/50",
                    "transition-all duration-400 ease-monk-gentle"
                  )}
                >
                  <FileJson className="w-4 h-4 opacity-70" />
                  Backup
                </button>

                <div className="relative">
                  <button
                    onClick={handleImportFromFile}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
                      "bg-secondary/50 text-secondary-foreground text-sm font-medium",
                      "border border-transparent hover:bg-secondary hover:border-border/50",
                      "transition-all duration-400 ease-monk-gentle"
                    )}
                  >
                    <Upload className="w-4 h-4 opacity-70" />
                    Import
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                  />
                </div>

                <button
                  onClick={handleExportCSV}
                  disabled={moments.length === 0}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
                    "bg-secondary/50 text-secondary-foreground text-sm font-medium",
                    "border border-transparent hover:bg-secondary hover:border-border/50",
                    "transition-all duration-400 ease-monk-gentle",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-secondary/50"
                  )}
                >
                  <Download className="w-4 h-4 opacity-70" />
                  CSV
                </button>

                <button
                  onClick={handleExportPDF}
                  disabled={moments.length === 0}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-3 rounded-lg",
                    "bg-secondary/50 text-secondary-foreground text-sm font-medium",
                    "border border-transparent hover:bg-secondary hover:border-border/50",
                    "transition-all duration-400 ease-monk-gentle",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-secondary/50"
                  )}
                >
                  <Download className="w-4 h-4 opacity-70" />
                  Journal
                </button>
              </div>

              <div className="pt-6 border-t border-border/40 space-y-3">
                {!showClearConfirm ? (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    disabled={moments.length === 0}
                    className={cn(
                      "w-full flex items-center justify-start gap-2 px-2 py-1.5 rounded-lg text-sm text-muted-foreground/80",
                      "hover:text-destructive hover:bg-destructive/10",
                      "transition-all duration-400 ease-monk-gentle",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-muted-foreground/80 disabled:hover:bg-transparent"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear all moments
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-destructive/10 animate-monk-fade-in">
                    <span className="text-xs font-medium text-destructive">Are you sure?</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleClearMoments}
                        className="text-xs font-medium text-destructive hover:underline"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {!showClearAllConfirm ? (
                  <button
                    onClick={() => setShowClearAllConfirm(true)}
                    className={cn(
                      "w-full flex items-center justify-start gap-2 px-2 py-1.5 rounded-lg text-sm text-muted-foreground/80",
                      "hover:text-destructive hover:bg-destructive/10",
                      "transition-all duration-400 ease-monk-gentle"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                    Reset application
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-destructive/10 animate-monk-fade-in">
                    <span className="text-xs font-medium text-destructive">Reset all settings?</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleClearAll}
                        className="text-xs font-medium text-destructive hover:underline"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setShowClearAllConfirm(false)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
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
