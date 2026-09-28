/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Download, 
  Smartphone, 
  Laptop, 
  Apple, 
  Share2, 
  PlusSquare, 
  CheckCircle2, 
  X, 
  WifiOff, 
  Sparkles, 
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isIOS, isInstalled, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6 relative overflow-hidden">
        
        {/* Decorative background aura */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#1F8A8A]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#17365D]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#17365D] to-[#1F8A8A] text-white rounded-2xl shadow-md">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900">
                Install WriteWise App
              </h2>
              <p className="text-xs text-slate-500">
                Install on Mobile, iOS, Android & Desktop PC
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 relative z-10 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-[#17365D] font-bold">
              <WifiOff className="h-3.5 w-3.5 text-[#1F8A8A]" />
              <span>Offline First</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              Draft chapters & matrices without Wi-Fi.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-[#17365D] font-bold">
              <HardDrive className="h-3.5 w-3.5 text-emerald-600" />
              <span>Auto-Sync</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              Auto-syncs changes once reconnected.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-[#17365D] font-bold">
              <Sparkles className="h-3.5 w-3.5 text-[#F4B942]" />
              <span>Fast & Native</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              Fullscreen experience, no browser clutter.
            </p>
          </div>
        </div>

        {/* Platform Specific Instructions */}
        <div className="space-y-3 relative z-10">
          
          {/* Direct Install Button if supported by Chromium/Edge/Android */}
          {isInstallable && (
            <div className="p-4 bg-gradient-to-r from-[#17365D] to-[#1F8A8A] rounded-2xl text-white space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F4B942]">
                  Instant 1-Click Install Available
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-100">
                Click below to add WriteWise to your desktop taskbar or mobile home screen.
              </p>
              <button
                type="button"
                onClick={handleNativeInstall}
                className="w-full py-2.5 bg-white text-[#17365D] hover:bg-slate-100 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Install WriteWise to Device</span>
              </button>
            </div>
          )}

          {/* iOS Safari Instructions */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Apple className="h-4 w-4 text-slate-700" />
              <span>For Apple iOS (iPhone & iPad Safari):</span>
            </div>
            <ol className="space-y-1.5 text-[11px] text-slate-600 pl-1">
              <li className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-slate-200 font-mono font-bold text-slate-700 flex items-center justify-center text-[10px] shrink-0">1</span>
                <span>Tap the <strong>Share</strong> button <Share2 className="inline h-3.5 w-3.5 text-blue-600 mx-0.5" /> in Safari's bottom toolbar.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-slate-200 font-mono font-bold text-slate-700 flex items-center justify-center text-[10px] shrink-0">2</span>
                <span>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="inline h-3.5 w-3.5 text-slate-700 mx-0.5" />.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-slate-200 font-mono font-bold text-slate-700 flex items-center justify-center text-[10px] shrink-0">3</span>
                <span>Tap <strong>Add</strong> at top right to launch as a standalone app.</span>
              </li>
            </ol>
          </div>

          {/* PC / Mac / Chrome / Edge Instructions */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Laptop className="h-4 w-4 text-slate-700" />
              <span>For PC (Windows, macOS, Linux, Chromebook):</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              In Chrome or Edge, click the <strong>Install WriteWise</strong> icon <Download className="inline h-3.5 w-3.5 text-[#17365D] mx-0.5" /> in the browser URL bar, or open the browser menu (⋮) &rarr; <em>"Install WriteWise"</em>.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs relative z-10">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Encrypted local storage with cloud sync</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
