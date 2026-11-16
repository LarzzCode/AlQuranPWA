import React, { useState, useEffect } from 'react';
import { Sun, Moon, ArrowRight, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getThemeClasses } from '../utils/themeClasses';
import { DAILY_ROUTINES } from '../data/routines';
import type { RoutineItem } from '../types/quran';

interface RoutineBannerProps {
  onSelectRoutine: (routine: RoutineItem) => void;
}

export const RoutineBanner: React.FC<RoutineBannerProps> = ({ onSelectRoutine }) => {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const [dismissed, setDismissed] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState<RoutineItem | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    const today = new Date().toISOString().split('T')[0];
    const completedRaw = localStorage.getItem(`quran_routines_completed_${today}`);
    const completed: Record<string, boolean> = completedRaw ? JSON.parse(completedRaw) : {};

    // Morning check: 04:00 - 13:00
    if (hour >= 4 && hour < 14) {
      const waqiah = DAILY_ROUTINES.find((r) => r.id === 'waqiah');
      if (waqiah && !completed['waqiah']) {
        setActiveRoutine(waqiah);
        return;
      }
    }

    // Evening / Night check: 17:00 - 04:00
    if (hour >= 17 || hour < 4) {
      const mulk = DAILY_ROUTINES.find((r) => r.id === 'mulk');
      if (mulk && !completed['mulk']) {
        setActiveRoutine(mulk);
        return;
      }
      const baqarah = DAILY_ROUTINES.find((r) => r.id === 'baqarah_last3');
      if (baqarah && !completed['baqarah_last3']) {
        setActiveRoutine(baqarah);
        return;
      }
    }

    setActiveRoutine(null);
  }, []);

  if (!activeRoutine || dismissed) return null;

  const isMorning = activeRoutine.timeType === 'morning';

  return (
    <div
      className={`mb-3 p-3.5 rounded-2xl border transition-all animate-fadeIn flex items-center justify-between ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-emerald-950/60 via-[#1C1C1E] to-[#1C1C1E] border-emerald-900/60 text-white'
          : theme === 'sepia'
          ? 'bg-gradient-to-r from-[#EFE5CC] to-[#EDE4CD] border-[#DECFA9] text-[#3D2E1E]'
          : 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-emerald-200 text-gray-900 shadow-sm'
      }`}
    >
      <div className="flex items-center space-x-3 flex-1 pr-2">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isMorning
              ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
              : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
          }`}
        >
          {isMorning ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </div>
        <div className="truncate">
          <div className="flex items-center space-x-1.5">
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                isMorning
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                  : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
              }`}
            >
              {isMorning ? 'Pengingat Pagi' : 'Pengingat Malam'}
            </span>
            <span className={`text-[10px] ${themeClasses.textSecondary}`}>• Belum dibaca</span>
          </div>
          <p className="text-xs font-bold truncate mt-0.5">
            Waktunya Membaca Surat {activeRoutine.title}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1.5">
        <button
          onClick={() => onSelectRoutine(activeRoutine)}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shrink-0"
        >
          <span>Baca</span>
          <ArrowRight className="w-3 h-3" />
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Tutup Pengingat"
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg active:scale-90"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
