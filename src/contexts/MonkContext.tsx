import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  AppSettings,
  Moment,
  DEFAULT_APP_SETTINGS
} from '@/types/monk';
import {
  initDatabase,
  getSettings,
  saveSettings as dbSaveSettings,
  getAllMoments,
  saveMoment as dbSaveMoment,
  clearAllMoments,
  clearAllData,
  getCustomAudio,
  saveCustomAudio
} from '@/lib/database';
import { saveBackup } from '@/lib/backup';

interface MonkContextType {
  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;

  // Moments
  moments: Moment[];
  addMoment: (moment: Moment) => Promise<void>;
  refreshMoments: () => Promise<void>;

  // Data management
  clearMoments: () => Promise<void>;
  clearAll: () => Promise<void>;

  // Loading state
  isLoading: boolean;

  // Custom Audio
  customAudioUrl: string | undefined;
  uploadCustomAudio: (file: File) => Promise<void>;
}

const MonkContext = createContext<MonkContextType | null>(null);

export function MonkProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | undefined>(undefined);

  // Initialize database and load data
  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
        const [loadedSettings, loadedMoments, loadedCustomAudio] = await Promise.all([
          getSettings(),
          getAllMoments(),
          getCustomAudio(),
        ]);
        // Merge with defaults to ensure new fields are present
        setSettings({ ...DEFAULT_APP_SETTINGS, ...loadedSettings });
        setMoments(loadedMoments.sort((a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        ));

        if (loadedCustomAudio) {
          setCustomAudioUrl(URL.createObjectURL(loadedCustomAudio));
        }
      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await dbSaveSettings(newSettings);
    await saveBackup();
  }, [settings]);

  const addMoment = useCallback(async (moment: Moment) => {
    await dbSaveMoment(moment);
    setMoments((prev) => [moment, ...prev].sort((a, b) =>
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    ));
    await saveBackup();
  }, []);

  const refreshMoments = useCallback(async () => {
    const loadedMoments = await getAllMoments();
    setMoments(loadedMoments.sort((a, b) =>
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    ));
  }, []);

  const clearMoments = useCallback(async () => {
    await clearAllMoments();
    setMoments([]);
    await saveBackup();
  }, []);

  const clearAll = useCallback(async () => {
    await clearAllData();
    setSettings(DEFAULT_APP_SETTINGS);
    setMoments([]);
    setCustomAudioUrl(undefined);
    await saveBackup();
  }, []);

  const uploadCustomAudio = useCallback(async (file: File) => {
    await saveCustomAudio(file);
    const url = URL.createObjectURL(file);
    setCustomAudioUrl(url);
    // Automatically select custom audio
    await updateSettings({ sound: { ...settings.sound, type: 'custom' } });
  }, [settings.sound, updateSettings]);

  return (
    <MonkContext.Provider
      value={{
        settings,
        updateSettings,
        moments,
        addMoment,
        refreshMoments,
        clearMoments,
        clearAll,
        isLoading,
        customAudioUrl,
        uploadCustomAudio,
      }}
    >
      {children}
    </MonkContext.Provider>
  );
}

export function useMonk() {
  const context = useContext(MonkContext);
  if (!context) {
    throw new Error('useMonk must be used within a MonkProvider');
  }
  return context;
}
