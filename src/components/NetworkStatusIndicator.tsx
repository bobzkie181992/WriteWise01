/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, Cloud, CloudOff, AlertCircle } from 'lucide-react';
import { useNetworkSync } from '../hooks/useNetworkSync';

export const NetworkStatusIndicator: React.FC = () => {
  const { 
    isOnline, 
    isSyncing, 
    lastSyncedAt, 
    pendingSyncCount, 
    showSyncToast, 
    dismissSyncToast, 
    triggerSync 
  } = useNetworkSync();

  return (
    <>
      {/* Header Compact Badge */}
      <div className="flex items-center gap-2">
        {isOnline ? (
          <button
            type="button"
            onClick={triggerSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
            title={`Connected. Last cloud sync: ${lastSyncedAt ? lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Just now'}`}
          >
            {isSyncing ? (
              <>
                <RefreshCw className="h-3 w-3 text-emerald-600 animate-spin" />
                <span className="hidden sm:inline">Syncing...</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden md:inline font-semibold">Online</span>
                <span className="text-[10px] text-emerald-600 hidden lg:inline">· Auto-Synced</span>
              </>
            )}
          </button>
        ) : (
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold animate-pulse"
            title="You are currently offline. Changes are saved locally and will auto-sync once reconnected."
          >
            <WifiOff className="h-3.5 w-3.5 text-amber-700" />
            <span>Offline Mode</span>
            {pendingSyncCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full text-[9px] font-mono">
                {pendingSyncCount} queued
              </span>
            )}
          </div>
        )}
      </div>

      {/* Floating Connectivity Toast Notification */}
      {showSyncToast && (
        <aside aria-label="Network status notification" className="fixed bottom-5 right-5 z-50 animate-bounce-in max-w-sm">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 ${
            showSyncToast.type === 'offline' 
              ? 'bg-slate-900 text-white border-amber-500/50' 
              : showSyncToast.type === 'synced'
              ? 'bg-[#17365D] text-white border-emerald-400/50'
              : 'bg-white text-slate-800 border-slate-200'
          }`}>
            <div className="p-2 rounded-xl bg-white/10 shrink-0">
              {showSyncToast.type === 'offline' ? (
                <WifiOff className="h-5 w-5 text-amber-400" />
              ) : (
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              )}
            </div>
            
            <div className="space-y-0.5 text-xs flex-1">
              <div className="font-bold flex items-center gap-1.5">
                {showSyncToast.type === 'offline' ? (
                  <span className="text-amber-300">Working in Offline Mode</span>
                ) : (
                  <span className="text-emerald-300">Connection Restored</span>
                )}
              </div>
              <p className="text-[11px] text-slate-200 leading-snug">
                {showSyncToast.message}
              </p>
            </div>

            <button
              onClick={dismissSyncToast}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </aside>
      )}
    </>
  );
};
