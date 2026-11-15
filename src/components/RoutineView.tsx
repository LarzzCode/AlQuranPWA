import React, { useState } from 'react';
import { Sun, Moon, ShieldCheck, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { DAILY_ROUTINES } from '../data/routines';
import { useTheme } from '../context/ThemeContext';
import { getThemeClasses } from '../utils/themeClasses';
import type { RoutineItem } from '../types/quran';

interface RoutineViewProps {
  onSelectRoutine: (routine: RoutineItem) => void;
}

export const RoutineView: React.FC<RoutineViewProps> = ({ onSelectRoutine }) => {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  // Completed today tracking
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`quran_routines_completed_${today}`);
    return saved ? JSON.parse(saved) : {};
  });

  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date().toISOString().split('T')[0];
    setCompletedItems((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(`quran_routines_completed_${today}`, JSON.stringify(next));
      return next;
    });
  };

  const currentHour = new Date().getHours();
  const isMorning = currentHour >= 4 && currentHour < 15;

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* iOS Hero Card */}
      <div
        className={`p-5 rounded-3xl border transition-all ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-[#1C1C1E] to-[#121214] border-[#2C2C2E]'
            : theme === 'sepia'
            ? 'bg-gradient-to-br from-[#EFE5CC] to-[#E5DAC0] border-[#DECFA9]'
            : 'bg-gradient-to-br from-white to-emerald-50/40 border-gray-200/80 shadow-sm'
        }`}
      >
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
          {isMorning ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          <span>{isMorning ? 'Rutinitas Pagi Ini' : 'Rutinitas Malam Ini'}</span>
        </div>
        <h2 className={`text-xl font-bold tracking-tight ${themeClasses.textPrimary}`}>
          Ruang Khusyu' Pribadi
        </h2>
        <p className={`text-xs mt-1 leading-relaxed ${themeClasses.textSecondary}`}>
          Khusus disiapkan untuk rutinitas harian Anda. 100% bebas dari segala iklan, tenang, dan terarah.
        </p>
      </div>

      {/* Routine Cards List */}
      <div className="space-y-3">
        {DAILY_ROUTINES.map((routine) => {
          const isDone = !!completedItems[routine.id];
          const isMorningRoutine = routine.timeType === 'morning';

          return (
            <div
              key={routine.id}
              onClick={() => onSelectRoutine(routine)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${themeClasses.cardBg} hover:border-emerald-500/50 relative overflow-hidden`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3.5 flex-1 pr-2">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isMorningRoutine
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    {isMorningRoutine ? (
                      <Sun className="w-5 h-5" />
                    ) : routine.id === 'baqarah_last3' ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                            isMorningRoutine
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300'
                          }`}
                        >
                          {routine.timeType === 'morning' ? 'Pagi' : 'Malam'}
                        </span>
                        {isDone && (
                          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            Selesai dibaca ✓
                          </span>
                        )}
                      </div>
                      <span className="font-arabic text-xl font-bold text-emerald-600 dark:text-emerald-400" dir="rtl">
                        {routine.arabicTitle}
                      </span>
                    </div>

                    <h3 className={`text-base font-semibold mt-1 tracking-tight ${themeClasses.textPrimary}`}>
                      {routine.title}
                    </h3>
                    <p className={`text-xs mt-0.5 ${themeClasses.textSecondary}`}>
                      {routine.subtitle}
                    </p>

                    <div
                      className={`mt-2.5 p-2.5 rounded-xl text-[11px] leading-relaxed border ${
                        theme === 'dark'
                          ? 'bg-[#141416] border-[#252528] text-gray-400'
                          : theme === 'sepia'
                          ? 'bg-[#E5DAC0]/60 border-[#DECFA9] text-[#6A5741]'
                          : 'bg-emerald-50/50 border-emerald-100 text-emerald-900/80'
                      }`}
                    >
                      {routine.fadhilah}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between self-stretch pl-1">
                  <button
                    onClick={(e) => toggleComplete(routine.id, e)}
                    title={isDone ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                    className="p-1 rounded-full text-emerald-600 dark:text-emerald-400 hover:scale-110 active:scale-95 transition-transform"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 fill-emerald-500 text-white" />
                    ) : (
                      <Circle className={`w-6 h-6 ${themeClasses.textSecondary}`} />
                    )}
                  </button>
                  <ChevronRight className={`w-4 h-4 ${themeClasses.textSecondary} mb-1`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
