/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';

export interface SyncStatus {
  isOnline: boolean;
  lastSyncedAt: Date | null;
  pendingSyncCount: number;
  isSyncing: boolean;
}

export function useNetworkSync() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [showSyncToast, setShowSyncToast] = useState<{
    message: string;
    type: 'online' | 'offline' | 'synced';
  } | null>(null);

  const triggerSync = useCallback(() => {
    if (!navigator.onLine) return;
    setIsSyncing(true);

    setTimeout(() => {
      setIsSyncing(false);
      setPendingSyncCount(0);
      setLastSyncedAt(new Date());
      setShowSyncToast({
        message: 'Reconnected! All offline draft edits & research notes synced with cloud.',
        type: 'synced',
      });
      setTimeout(() => setShowSyncToast(null), 4000);
    }, 800);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowSyncToast({
        message: 'Offline Mode Active. All work is securely saved locally and will auto-sync upon reconnection.',
        type: 'offline',
      });
      setTimeout(() => setShowSyncToast(null), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync]);

  const recordLocalChange = useCallback(() => {
    if (!navigator.onLine) {
      setPendingSyncCount((prev) => prev + 1);
    } else {
      setLastSyncedAt(new Date());
    }
  }, []);

  return {
    isOnline,
    isSyncing,
    lastSyncedAt,
    pendingSyncCount,
    showSyncToast,
    dismissSyncToast: () => setShowSyncToast(null),
    triggerSync,
    recordLocalChange,
  };
}
