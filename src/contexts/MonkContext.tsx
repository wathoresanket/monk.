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
  clearAllData
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
}

const MonkContext = createContext<MonkContextType | null>(null);

export function MonkProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize database and load data
  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
        const [loadedSettings, loadedMoments] = await Promise.all([
          getSettings(),
          getAllMoments(),
        ]);
        // Merge with defaults to ensure new fields are present
        setSettings({ ...DEFAULT_APP_SETTINGS, ...loadedSettings });
        setMoments(loadedMoments.sort((a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        ));
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
    await saveBackup();
  }, []);

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
