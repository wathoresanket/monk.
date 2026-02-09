
import { writeTextFile, readTextFile, BaseDirectory, exists, mkdir } from '@tauri-apps/plugin-fs';
import { AppSettings, Moment, PatternInsight } from '@/types/monk';
import { getAllMoments, getSettings, saveSettings, saveMoment } from './database';

const BACKUP_DIR = 'Monk';
const BACKUP_FILE = 'monk_backup.json';

interface BackupData {
    version: number;
    timestamp: string;
    settings: AppSettings;
    moments: Moment[];
}

export async function saveBackup(): Promise<void> {
    try {
        // Ensure directory exists
        const dirExists = await exists(BACKUP_DIR, { baseDir: BaseDirectory.Document });
        if (!dirExists) {
            await mkdir(BACKUP_DIR, { baseDir: BaseDirectory.Document });
        }

        const [settings, moments] = await Promise.all([
            getSettings(),
            getAllMoments(),
        ]);

        const backupData: BackupData = {
            version: 1,
            timestamp: new Date().toISOString(),
            settings,
            moments,
        };

        await writeTextFile(
            `${BACKUP_DIR}/${BACKUP_FILE}`,
            JSON.stringify(backupData, null, 2),
            { baseDir: BaseDirectory.Document }
        );

        console.log('Backup saved successfully');
    } catch (error) {
        console.error('Failed to save backup:', error);
    }
}

export async function restoreBackup(): Promise<boolean> {
    try {
        const existsBackup = await exists(`${BACKUP_DIR}/${BACKUP_FILE}`, { baseDir: BaseDirectory.Document });
        if (!existsBackup) {
            return false;
        }

        const content = await readTextFile(`${BACKUP_DIR}/${BACKUP_FILE}`, { baseDir: BaseDirectory.Document });
        const data: BackupData = JSON.parse(content);

        // Validate data structure roughly
        if (!data.moments || !data.settings) {
            throw new Error('Invalid backup format');
        }

        // Import settings
        await saveSettings(data.settings);

        // Import moments (merge strategy: overwrite if exists, add if new)
        for (const moment of data.moments) {
            await saveMoment(moment);
        }

        return true;
    } catch (error) {
        console.error('Failed to restore backup:', error);
        return false;
    }
}

export async function exportData(): Promise<string> {
    const [settings, moments] = await Promise.all([
        getSettings(),
        getAllMoments(),
    ]);

    const backupData: BackupData = {
        version: 1,
        timestamp: new Date().toISOString(),
        settings,
        moments,
    };

    return JSON.stringify(backupData, null, 2);
}

export async function importData(jsonData: string): Promise<boolean> {
    try {
        const data: BackupData = JSON.parse(jsonData);

        // Validate basic structure
        if (!data.settings || !Array.isArray(data.moments)) {
            throw new Error('Invalid backup format: missing settings or moments');
        }

        // Import settings
        await saveSettings(data.settings);

        // Import moments
        // Strategy: We iterate through imported moments and save them.
        // saveMoment uses `put`, so it will update if ID exists, or insert if not.
        for (const moment of data.moments) {
            await saveMoment(moment);
        }

        return true;
    } catch (error) {
        console.error('Failed to import data:', error);
        throw error;
    }
}
