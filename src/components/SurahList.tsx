import React, { useState, useMemo } from 'react';
import { Search, X, Sparkles, BookOpen, Clock, ChevronRight } from 'lucide-react';
import type { SurahSummary, Bookmark, RoutineItem } from '../types/quran';
import { useTheme } from '../context/ThemeContext';
import { getThemeClasses } from '../utils/themeClasses';
import { DAILY_ROUTINES } from '../data/routines';

interface SurahListProps {
  surahs: SurahSummary[];
  loading: boolean;
  error: string | null;
  onSelectSurah: (surahNumber: number) => void;
  onSelectRoutine: (routine: RoutineItem) => void;
  onRetry: () => void;
  lastRead: Bookmark | null;
}

export const SurahList: React.FC<SurahListProps> = ({
  surahs,
  loading,
  error,
  onSelectSurah,
  onSelectRoutine,
  onRetry,
  lastRead,
}) => {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'makkiyah' | 'madaniyah'>('all');

  const filteredSurahs = useMemo(() => {
    return surahs.filter((s) => {
      // Filter by type
      if (filterType === 'makkiyah' && s.tempatTurun.toLowerCase() !== 'mekah') return false;
      if (filterType === 'madaniyah' && s.tempatTurun.toLowerCase() !== 'madinah') return false;

      // Filter by query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        s.namaLatin.toLowerCase().includes(q) ||
        s.arti.toLowerCase().includes(q) ||
        s.nomor.toString() === q ||
        s.nama.includes(q)
      );
    });
  }, [surahs, searchQuery, filterType]);

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Quick Routine Banner (Personal Focus) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className={`text-xs font-semibold uppercase tracking-wider ${themeClasses.textSecondary} flex items-center gap-1.5`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Rutinitas Harian Anda
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {DAILY_ROUTINES.map((routine) => (
            <button
              key={routine.id}
              onClick={() => onSelectRoutine(routine)}
              className={`p-2.5 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${themeClasses.cardBg} hover:border-emerald-500/50`}
            >
              <div>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md inline-block mb-1.5 ${
                    routine.timeType === 'morning'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300'
                  }`}
                >
                  {routine.timeType === 'morning' ? 'Pagi' : 'Malam'}
                </span>
                <h4 className={`text-xs font-bold leading-tight truncate ${themeClasses.textPrimary}`}>
                  {routine.title}
                </h4>
              </div>
              <span className="font-arabic text-sm text-emerald-600 dark:text-emerald-400 mt-2 text-right">
                {routine.arabicTitle}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Last Read Quick Resume (if exists) */}
      {lastRead && (
        <div
          onClick={() => onSelectSurah(lastRead.surahNumber)}
          className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all active:scale-[0.99] ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-emerald-950/40 to-[#1C1C1E] border-emerald-900/50'
              : theme === 'sepia'
              ? 'bg-gradient-to-r from-[#EAE0C8] to-[#EDE4CD] border-[#D6C197]'
              : 'bg-gradient-to-r from-emerald-50 to-white border-emerald-200/80 shadow-sm'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Terakhir Dibaca
              </span>
              <h4 className={`text-sm font-bold ${themeClasses.textPrimary}`}>
                Surat {lastRead.surahName} : Ayat {lastRead.ayatNumber}
              </h4>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 ${themeClasses.textSecondary}`} />
        </div>
      )}

      {/* iOS Search Input */}
      <div className="relative">
        <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${themeClasses.textSecondary}`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari surat (contoh: Waqiah, 56, Mulk, Baqarah)..."
          className={`w-full pl-10 pr-10 py-2.5 rounded-2xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all ${themeClasses.inputBg}`}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Segmented Control (iOS style) */}
      <div
        className={`p-1 rounded-xl flex items-center text-xs border ${
          theme === 'dark'
            ? 'bg-[#1C1C1E] border-[#2C2C2E]'
            : theme === 'sepia'
            ? 'bg-[#E3D3B1] border-[#D6C197]'
            : 'bg-gray-200/70 border-gray-300/50'
        }`}
      >
        <button
          onClick={() => setFilterType('all')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
            filterType === 'all'
              ? `${theme === 'dark' ? 'bg-[#2C2C2E] text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'}`
              : themeClasses.textSecondary
          }`}
        >
          Semua (114)
        </button>
        <button
          onClick={() => setFilterType('makkiyah')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
            filterType === 'makkiyah'
              ? `${theme === 'dark' ? 'bg-[#2C2C2E] text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'}`
              : themeClasses.textSecondary
          }`}
        >
          Makkiyah
        </button>
        <button
          onClick={() => setFilterType('madaniyah')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
            filterType === 'madaniyah'
              ? `${theme === 'dark' ? 'bg-[#2C2C2E] text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm'}`
              : themeClasses.textSecondary
          }`}
        >
          Madaniyah
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && surahs.length === 0 && (
        <div className="space-y-2.5">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-2xl border animate-pulse flex items-center justify-between ${themeClasses.cardBg}`}
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
                <div className="space-y-1.5">
                  <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-3 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              </div>
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error View */}
      {error && (
        <div className={`p-6 rounded-2xl border text-center space-y-3 ${themeClasses.cardBg}`}>
          <p className="text-sm text-red-500 font-medium">{error}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 active:scale-95 transition-transform"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredSurahs.length === 0 && !error && (
        <div className={`p-8 rounded-2xl border text-center space-y-2 ${themeClasses.cardBg}`}>
          <BookOpen className={`w-8 h-8 mx-auto ${themeClasses.textSecondary} opacity-40`} />
          <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>Tidak ada surat yang cocok</p>
          <p className={`text-xs ${themeClasses.textSecondary}`}>Coba cari dengan kata kunci lain.</p>
        </div>
      )}

      {/* Surah List */}
      <div className="space-y-2">
        {filteredSurahs.map((surah) => (
          <div
            key={surah.nomor}
            onClick={() => onSelectSurah(surah.nomor)}
            className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all active:scale-[0.98] ${themeClasses.cardBg} hover:border-emerald-500/50`}
          >
            <div className="flex items-center space-x-3.5">
              {/* Surah Number Badge */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                  theme === 'dark'
                    ? 'bg-[#252528] border-[#3A3A3C] text-emerald-400'
                    : theme === 'sepia'
                    ? 'bg-[#E3D3B1] border-[#D6C197] text-[#78350F]'
                    : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                }`}
              >
                {surah.nomor}
              </div>

              <div>
                <h3 className={`text-sm font-bold tracking-tight ${themeClasses.textPrimary}`}>
                  {surah.namaLatin}
                </h3>
                <p className={`text-[11px] ${themeClasses.textSecondary}`}>
                  {surah.arti} • {surah.jumlahAyat} Ayat • {surah.tempatTurun === 'Mekah' ? 'Makkiyah' : 'Madaniyah'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-arabic text-lg font-bold text-emerald-600 dark:text-emerald-400" dir="rtl">
                {surah.nama}
              </span>
              <ChevronRight className={`w-4 h-4 ${themeClasses.textSecondary}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
