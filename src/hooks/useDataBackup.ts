import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface BackupData {
  timestamp: number;
  userId: string;
  data: any;
  type: 'links' | 'appearance' | 'profile';
}

export const useDataBackup = () => {
  const { user } = useAuth();

  const createBackup = useCallback((data: any, type: BackupData['type']) => {
    if (!user) return;

    try {
      const backup: BackupData = {
        timestamp: Date.now(),
        userId: user.id,
        data,
        type
      };

      const backupKey = `pocketcv_backup_${type}_${user.id}`;
      localStorage.setItem(backupKey, JSON.stringify(backup));
      
      // Keep only the last 3 backups
      const allKeys = Object.keys(localStorage).filter(key => 
        key.startsWith(`pocketcv_backup_${type}_${user.id}`)
      );
      
      if (allKeys.length > 3) {
        const sortedKeys = allKeys.sort((a, b) => {
          const aBackup = JSON.parse(localStorage.getItem(a) || '{}');
          const bBackup = JSON.parse(localStorage.getItem(b) || '{}');
          return aBackup.timestamp - bBackup.timestamp;
        });
        
        // Remove oldest backups
        sortedKeys.slice(0, -3).forEach(key => {
          localStorage.removeItem(key);
        });
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }, [user]);

  const getLatestBackup = useCallback((type: BackupData['type']): BackupData | null => {
    if (!user) return null;

    try {
      const backupKey = `pocketcv_backup_${type}_${user.id}`;
      const backup = localStorage.getItem(backupKey);
      return backup ? JSON.parse(backup) : null;
    } catch (error) {
      console.error('Failed to retrieve backup:', error);
      return null;
    }
  }, [user]);

  const clearBackups = useCallback((type?: BackupData['type']) => {
    if (!user) return;

    try {
      const pattern = type 
        ? `pocketcv_backup_${type}_${user.id}`
        : `pocketcv_backup_`;
      
      Object.keys(localStorage)
        .filter(key => key.includes(pattern))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear backups:', error);
    }
  }, [user]);

  // Auto-cleanup old backups on mount
  useEffect(() => {
    if (!user) return;

    try {
      const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      Object.keys(localStorage)
        .filter(key => key.startsWith('pocketcv_backup_'))
        .forEach(key => {
          try {
            const backup = JSON.parse(localStorage.getItem(key) || '{}');
            if (backup.timestamp < cutoffTime) {
              localStorage.removeItem(key);
            }
          } catch {
            // Remove corrupted backup
            localStorage.removeItem(key);
          }
        });
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
    }
  }, [user]);

  return {
    createBackup,
    getLatestBackup,
    clearBackups
  };
};
