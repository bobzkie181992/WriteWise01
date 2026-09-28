/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Check, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sidebar' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'header',
  className = ''
}) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already installed and running standalone, show a subtle installed indicator or return null based on variant
  if (isInstalled && variant === 'header') {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  if (variant === 'sidebar') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={`w-full p-2.5 rounded-xl border border-[#17365D]/20 bg-gradient-to-r from-[#17365D]/5 to-[#1F8A8A]/10 hover:from-[#17365D]/10 hover:to-[#1F8A8A]/20 transition-all flex items-center justify-between text-xs text-[#17365D] font-bold group cursor-pointer ${className}`}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#17365D] text-white rounded-lg group-hover:scale-105 transition-transform">
              <Download className="h-3.5 w-3.5" />
            </div>
            <div className="text-left">
              <span className="block text-[11px] font-bold">Install App</span>
              <span className="block text-[9px] font-normal text-slate-500">Mobile, iOS & PC</span>
            </div>
          </div>
          <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200 text-[#17365D] font-mono">
            PWA
          </span>
        </button>

        <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#17365D] to-[#1F8A8A] text-white hover:opacity-95 shadow-xs text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${className}`}
        title="Install WriteWise as an app on Mobile, iOS or PC"
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
