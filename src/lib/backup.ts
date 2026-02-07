
import { writeTextFile, readTextFile, BaseDirectory, exists, mkdir } from '@tauri-apps/plugin-fs';
import { AppSettings, Moment } from '@/types/monk';
import { getAllMoments, getSettings } from './database';

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

        // TODO: Import data back into IndexedDB
        // For now we just return true to indicate success reading
        return true;
    } catch (error) {
        console.error('Failed to restore backup:', error);
        return false;
    }
}
