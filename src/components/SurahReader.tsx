import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  Bookmark as BookmarkIcon,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  ArrowUp,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  X,
  Type,
} from 'lucide-react';
import type { SurahDetail, Ayat, Bookmark } from '../types/quran';
import { useTheme } from '../context/ThemeContext';
import { getThemeClasses } from '../utils/themeClasses';

interface SurahReaderProps {
  surah: SurahDetail;
  onNavigateSurah: (surahNumber: number) => void;
  onSaveBookmark: (bookmark: Bookmark) => void;
  currentBookmark: Bookmark | null;
  targetAyatStart?: number;
  targetAyatEnd?: number;
}

export const SurahReader: React.FC<SurahReaderProps> = ({
  surah,
  onNavigateSurah,
  onSaveBookmark,
  currentBookmark,
  targetAyatStart,
  targetAyatEnd,
}) => {
  const {
    theme,
    arabicFontSize,
    setArabicFontSize,
    showLatin,
    showTranslation,
  } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const [copiedAyat, setCopiedAyat] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [playingAyat, setPlayingAyat] = useState<number | null>(null);
  const [isPlayingFull, setIsPlayingFull] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showJumpModal, setShowJumpModal] = useState(false);
  const [showFontModal, setShowFontModal] = useState(false);

  // Pagination states
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jumpAyatInput, setJumpAyatInput] = useState<string>('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filter ayahs if target range is set (e.g. Baqarah 284-286)
  const [activeRange, setActiveRange] = useState<{ start?: number; end?: number } | null>(
    targetAyatStart ? { start: targetAyatStart, end: targetAyatEnd } : null
  );

  // Determine base ayahs to display (either activeRange or full surah)
  const baseAyat = useMemo(() => {
    if (activeRange?.start) {
      return surah.ayat.filter(
        (a) => a.nomorAyat >= activeRange.start! && (!activeRange.end || a.nomorAyat <= activeRange.end)
      );
    }
    return surah.ayat;
  }, [surah.ayat, activeRange]);

  // Compute pagination parameters
  const totalPages = useMemo(() => {
    if (pageSize >= baseAyat.length) return 1;
    return Math.ceil(baseAyat.length / pageSize);
  }, [baseAyat.length, pageSize]);

  // Paginated items
  const paginatedAyat = useMemo(() => {
    if (pageSize >= baseAyat.length) return baseAyat;
    const startIdx = (currentPage - 1) * pageSize;
    return baseAyat.slice(startIdx, startIdx + pageSize);
  }, [baseAyat, currentPage, pageSize]);

  // If targetAyatStart is passed, calculate appropriate initial page
  useEffect(() => {
    if (targetAyatStart && !activeRange) {
      const pageIndex = Math.ceil(targetAyatStart / pageSize);
      setCurrentPage(Math.max(1, Math.min(pageIndex, totalPages)));
    }
  }, [targetAyatStart, pageSize, totalPages, activeRange]);

  // Reset page when surah changes
  useEffect(() => {
    setCurrentPage(1);
    setActiveRange(targetAyatStart ? { start: targetAyatStart, end: targetAyatEnd } : null);
  }, [surah.nomor, targetAyatStart, targetAyatEnd]);

  // Scroll listener for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cleanup audio on unmount or surah change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [surah.nomor]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Jump to specific ayah
  const handleJumpToAyat = (e: React.FormEvent) => {
    e.preventDefault();
    const ayatNum = parseInt(jumpAyatInput, 10);
    if (isNaN(ayatNum) || ayatNum < 1 || ayatNum > surah.jumlahAyat) {
      alert(`Nomor ayat harus di antara 1 dan ${surah.jumlahAyat}`);
      return;
    }

    if (activeRange) {
      setActiveRange(null); // Reset range filter to full surah
    }

    const targetPage = Math.ceil(ayatNum / pageSize);
    setCurrentPage(targetPage);
    setShowJumpModal(false);
    setJumpAyatInput('');

    setTimeout(() => {
      const el = document.getElementById(`ayat-${ayatNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
  };

  const handlePlayAyat = (ayat: Ayat) => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (playingAyat === ayat.nomorAyat) {
        setPlayingAyat(null);
        audioRef.current = null;
        return;
      }
    }

    const audioUrl = ayat.audio?.['05'] || (ayat.audio && Object.values(ayat.audio)[0]);
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setPlayingAyat(ayat.nomorAyat);
    setIsPlayingFull(false);

    audio.play().catch((err) => {
      console.warn('Audio play failed', err);
      setPlayingAyat(null);
    });

    audio.onended = () => {
      setPlayingAyat(null);
      // Auto-play next verse if available
      const nextAyatNumber = ayat.nomorAyat + 1;
      const nextAyat = surah.ayat.find((a) => a.nomorAyat === nextAyatNumber);
      if (nextAyat) {
        // If next ayat is on the next page, advance page automatically
        if (nextAyatNumber > currentPage * pageSize && currentPage < totalPages) {
          setCurrentPage((prev) => prev + 1);
        }
        handlePlayAyat(nextAyat);
      }
    };
  };

  const handlePlayFull = () => {
    if (audioRef.current && isPlayingFull) {
      audioRef.current.pause();
      setIsPlayingFull(false);
      setPlayingAyat(null);
      return;
    }

    const audioUrl = surah.audioFull?.['05'] || (surah.audioFull && Object.values(surah.audioFull)[0]);
    if (!audioUrl) return;

    if (audioRef.current) audioRef.current.pause();

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setIsPlayingFull(true);
    setPlayingAyat(null);

    audio.play().catch((err) => {
      console.warn('Full audio failed', err);
      setIsPlayingFull(false);
    });

    audio.onended = () => {
      setIsPlayingFull(false);
    };
  };

  const handleCopyAyat = (ayat: Ayat) => {
    const text = `${ayat.teksArab}\n\n"${ayat.teksIndonesia}"\n(QS. ${surah.namaLatin} ${surah.nomor}:${ayat.nomorAyat})`;
    navigator.clipboard.writeText(text);
    setCopiedAyat(ayat.nomorAyat);
    setTimeout(() => setCopiedAyat(null), 2000);
  };

  const handleBookmark = (ayat: Ayat) => {
    onSaveBookmark({
      surahNumber: surah.nomor,
      surahName: surah.namaLatin,
      ayatNumber: ayat.nomorAyat,
      updatedAt: new Date().toISOString(),
    });
  };

  const isBaqarah = surah.nomor === 2;
  const showBasmalah = surah.nomor !== 1 && surah.nomor !== 9;

  const firstAyatOnPage = paginatedAyat[0]?.nomorAyat || 1;
  const lastAyatOnPage = paginatedAyat[paginatedAyat.length - 1]?.nomorAyat || 1;

  return (
    <div className="space-y-4 pb-36 animate-fadeIn">
      {/* Surah Header Card (iOS Cupertino Glass Style) */}
      <div
        className={`p-5 rounded-3xl border transition-all relative overflow-hidden text-center ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-[#1C1C1E] to-[#121214] border-[#2C2C2E]'
            : theme === 'sepia'
            ? 'bg-gradient-to-br from-[#EDE4CD] to-[#E3D3B1] border-[#DECFA9]'
            : 'bg-gradient-to-br from-white to-emerald-50/50 border-gray-200/80 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between text-xs mb-2">
          <span
            className={`font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              theme === 'dark'
                ? 'bg-[#2C2C2E] text-emerald-400'
                : theme === 'sepia'
                ? 'bg-[#E3D3B1] text-[#78350F]'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            Surat Ke-{surah.nomor} • {surah.tempatTurun === 'Mekah' ? 'Makkiyah' : 'Madaniyah'}
          </span>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-1.5 rounded-full transition-transform active:scale-95 ${themeClasses.textSecondary} hover:text-emerald-500`}
            title="Keterangan Surat"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        <h2 className={`text-2xl font-bold tracking-tight ${themeClasses.textPrimary}`}>
          {surah.namaLatin}
        </h2>
        <p className={`text-xs mt-0.5 ${themeClasses.textSecondary}`}>
          "{surah.arti}" • {surah.jumlahAyat} Ayat
        </p>

        <div className="my-3">
          <span className="font-arabic text-4xl text-emerald-600 dark:text-emerald-400 font-bold block" dir="rtl">
            {surah.nama}
          </span>
        </div>

        {/* Audio Full Reciter Play Button */}
        {surah.audioFull && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              onClick={handlePlayFull}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 ${
                isPlayingFull
                  ? 'bg-emerald-600 text-white'
                  : theme === 'dark'
                  ? 'bg-[#2C2C2E] text-gray-200 border border-[#3A3A3C]'
                  : theme === 'sepia'
                  ? 'bg-[#DFD3B3] text-[#4F3B25] border border-[#D1C29E]'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {isPlayingFull ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingFull ? 'Jeda Murottal Surat' : 'Putar Murottal Surat Lengkap'}</span>
            </button>
          </div>
        )}

        {/* Description Accordion */}
        {showInfo && (
          <div
            className={`mt-4 p-4 rounded-2xl text-left text-xs leading-relaxed border ${
              theme === 'dark'
                ? 'bg-[#161618] border-[#2A2A2D] text-gray-300'
                : theme === 'sepia'
                ? 'bg-[#E5DAC0]/80 border-[#DECFA9] text-[#4A3B2A]'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}
            dangerouslySetInnerHTML={{ __html: surah.deskripsi }}
          />
        )}

        {/* Shortcut button for Al-Baqarah 284-286 */}
        {isBaqarah && (
          <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-800 flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => {
                if (activeRange?.start === 284) {
                  setActiveRange(null);
                  setCurrentPage(1);
                } else {
                  setActiveRange({ start: 284, end: 286 });
                  setCurrentPage(1);
                }
              }}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all border ${
                activeRange?.start === 284
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
              }`}
            >
              {activeRange?.start === 284
                ? '✓ Menampilkan 3 Ayat Terakhir (284-286)'
                : '🌙 Fokus ke 3 Ayat Terakhir (284-286)'}
            </button>

            {activeRange && (
              <button
                onClick={() => {
                  setActiveRange(null);
                  setCurrentPage(1);
                }}
                className={`text-xs px-3 py-1.5 rounded-xl border ${themeClasses.cardElevated} ${themeClasses.textSecondary}`}
              >
                Tampilkan Seluruh 286 Ayat
              </button>
            )}
          </div>
        )}
      </div>

      {/* Paging Bar (Top Indicator & Controls) */}
      <div
        className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${themeClasses.cardBg}`}
      >
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            Hal {currentPage} dari {totalPages}
          </span>
          <span className={themeClasses.textSecondary}>•</span>
          <span className={themeClasses.textSecondary}>
            Ayat {firstAyatOnPage} - {lastAyatOnPage}
          </span>
        </div>

        {/* Page size selector pills */}
        <div className="flex items-center space-x-1.5">
          <span className={`text-[10px] hidden sm:inline ${themeClasses.textSecondary}`}>
            Per Halaman:
          </span>
          {[10, 20, 30].map((size) => (
            <button
              key={size}
              onClick={() => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                pageSize === size
                  ? 'bg-emerald-600 text-white font-bold'
                  : `${themeClasses.cardElevated} ${themeClasses.textSecondary}`
              }`}
            >
              {size}
            </button>
          ))}
          <button
            onClick={() => {
              setPageSize(surah.jumlahAyat);
              setCurrentPage(1);
            }}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
              pageSize >= surah.jumlahAyat
                ? 'bg-emerald-600 text-white font-bold'
                : `${themeClasses.cardElevated} ${themeClasses.textSecondary}`
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* Basmalah Banner (displayed on Page 1) */}
      {showBasmalah && currentPage === 1 && (!activeRange || activeRange.start === 1) && (
        <div className={`p-5 rounded-2xl border text-center ${themeClasses.cardBg}`}>
          <p className="font-arabic text-2xl text-emerald-600 dark:text-emerald-400" dir="rtl">
            بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
          <p className={`text-xs mt-1 italic ${themeClasses.textSecondary}`}>
            Dengan nama Allah Yang Maha Pengasih, Maha Penyayang
          </p>
        </div>
      )}

      {/* Verses List */}
      <div className="space-y-3.5">
        {paginatedAyat.map((ayat) => {
          const isBookmarked =
            currentBookmark?.surahNumber === surah.nomor &&
            currentBookmark?.ayatNumber === ayat.nomorAyat;
          const isPlayingThis = playingAyat === ayat.nomorAyat;

          return (
            <div
              key={ayat.nomorAyat}
              id={`ayat-${ayat.nomorAyat}`}
              className={`p-4 md:p-5 rounded-2xl border transition-all ${
                isPlayingThis
                  ? theme === 'dark'
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-md ring-1 ring-emerald-500'
                    : 'border-emerald-500 bg-emerald-50/70 shadow-md ring-1 ring-emerald-500'
                  : themeClasses.cardBg
              }`}
            >
              {/* Ayah Actions & Number Row */}
              <div
                className={`flex items-center justify-between pb-3 mb-3 border-b ${
                  theme === 'dark'
                    ? 'border-[#2C2C2E]'
                    : theme === 'sepia'
                    ? 'border-[#DECFA9]'
                    : 'border-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center border ${
                      isPlayingThis
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : theme === 'dark'
                        ? 'bg-[#252528] text-emerald-400 border-[#3A3A3C]'
                        : theme === 'sepia'
                        ? 'bg-[#E3D3B1] text-[#78350F] border-[#D6C197]'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {ayat.nomorAyat}
                  </span>
                  <span className={`text-[11px] font-medium ${themeClasses.textSecondary}`}>
                    Ayat {ayat.nomorAyat}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {/* Play Ayah Audio */}
                  <button
                    onClick={() => handlePlayAyat(ayat)}
                    title={isPlayingThis ? 'Jeda Audio' : 'Putar Audio Ayat'}
                    className={`p-2 rounded-xl transition-all active:scale-90 ${
                      isPlayingThis
                        ? 'bg-emerald-600 text-white'
                        : `${themeClasses.cardElevated} ${themeClasses.textSecondary} hover:text-emerald-500`
                    }`}
                  >
                    {isPlayingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => handleBookmark(ayat)}
                    title={isBookmarked ? 'Ditandai terakhir dibaca' : 'Tandai terakhir dibaca'}
                    className={`p-2 rounded-xl transition-all active:scale-90 ${
                      isBookmarked
                        ? 'bg-amber-500 text-white'
                        : `${themeClasses.cardElevated} ${themeClasses.textSecondary} hover:text-amber-500`
                    }`}
                  >
                    <BookmarkIcon className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />
                  </button>

                  {/* Copy Ayah */}
                  <button
                    onClick={() => handleCopyAyat(ayat)}
                    title="Salin Ayat & Terjemahan"
                    className={`p-2 rounded-xl transition-all active:scale-90 ${themeClasses.cardElevated} ${themeClasses.textSecondary} hover:text-emerald-500`}
                  >
                    {copiedAyat === ayat.nomorAyat ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Arabic Text */}
              <div className="py-2 text-right" dir="rtl">
                <p
                  className="font-arabic text-emerald-600 dark:text-emerald-400 font-normal select-text tracking-wide"
                  style={{ fontSize: `${arabicFontSize}px`, lineHeight: 2.2 }}
                >
                  {ayat.teksArab}
                </p>
              </div>

              {/* Latin Transliteration */}
              {showLatin && (
                <p
                  className={`mt-2 text-xs font-medium leading-relaxed ${
                    theme === 'dark'
                      ? 'text-emerald-300/80'
                      : theme === 'sepia'
                      ? 'text-[#8C5E28]'
                      : 'text-emerald-800'
                  }`}
                >
                  {ayat.teksLatin}
                </p>
              )}

              {/* Indonesian Translation */}
              {showTranslation && (
                <p className={`mt-1.5 text-xs leading-relaxed ${themeClasses.textPrimary}`}>
                  {ayat.teksIndonesia}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* In-Page Bottom Navigation Stepper */}
      {totalPages > 1 && (
        <div className="pt-2 flex items-center justify-between gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex-1 py-3 px-4 rounded-2xl border flex items-center justify-center space-x-2 text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${themeClasses.cardBg}`}
          >
            <ChevronLeft className="w-4 h-4 text-emerald-500" />
            <span>Halaman Sebelumnya</span>
          </button>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex-1 py-3 px-4 rounded-2xl border flex items-center justify-center space-x-2 text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${themeClasses.cardBg}`}
          >
            <span>Halaman Berikutnya</span>
            <ChevronRight className="w-4 h-4 text-emerald-500" />
          </button>
        </div>
      )}

      {/* Prev / Next Surah Navigation Buttons */}
      <div className="pt-2 flex items-center justify-between gap-3">
        {surah.suratSebelumnya ? (
          <button
            onClick={() => onNavigateSurah((surah.suratSebelumnya as any).nomor)}
            className={`flex-1 p-3.5 rounded-2xl border flex items-center space-x-2 transition-all active:scale-95 ${themeClasses.cardBg}`}
          >
            <ChevronLeft className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="text-left truncate">
              <span className={`text-[10px] uppercase font-semibold ${themeClasses.textSecondary}`}>
                Surat Sebelumnya
              </span>
              <p className={`text-xs font-bold truncate ${themeClasses.textPrimary}`}>
                {(surah.suratSebelumnya as any).namaLatin}
              </p>
            </div>
          </button>
        ) : (
          <div className="flex-1" />
        )}

        {surah.suratSelanjutnya && (
          <button
            onClick={() => onNavigateSurah((surah.suratSelanjutnya as any).nomor)}
            className={`flex-1 p-3.5 rounded-2xl border flex items-center justify-end space-x-2 transition-all active:scale-95 ${themeClasses.cardBg}`}
          >
            <div className="text-right truncate">
              <span className={`text-[10px] uppercase font-semibold ${themeClasses.textSecondary}`}>
                Surat Berikutnya
              </span>
              <p className={`text-xs font-bold truncate ${themeClasses.textPrimary}`}>
                {(surah.suratSelanjutnya as any).namaLatin}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" />
          </button>
        )}
      </div>

      {/* MODERN iOS FLOATING ISLAND BAR (Reading Controller Dock) */}
      <div className="fixed bottom-4 left-0 right-0 z-40 px-3 pointer-events-none">
        <div
          className={`max-w-md mx-auto pointer-events-auto rounded-full p-2 border shadow-2xl shadow-black/20 dark:shadow-black/60 transition-all flex items-center justify-between ${
            theme === 'dark'
              ? 'bg-[#18181A]/90 backdrop-blur-2xl border-[#2C2C2E]'
              : theme === 'sepia'
              ? 'bg-[#F2E8D2]/95 backdrop-blur-2xl border-[#DECFA9]'
              : 'bg-white/95 backdrop-blur-2xl border-gray-200/90 shadow-gray-200/60'
          }`}
        >
          {/* Previous Page Pill */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Halaman Sebelumnya"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ChevronLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </button>

          {/* Center Info & Quick Jump Trigger */}
          <button
            onClick={() => setShowJumpModal(true)}
            className={`px-3 py-1.5 rounded-full flex items-center space-x-1.5 transition-all active:scale-95 border ${
              theme === 'dark'
                ? 'bg-[#252528] border-[#3A3A3C] text-gray-200'
                : theme === 'sepia'
                ? 'bg-[#E3D3B1] border-[#D6C197] text-[#5A452E]'
                : 'bg-gray-100 border-gray-200 text-gray-800'
            }`}
          >
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Hal {currentPage}/{totalPages}
            </span>
            <span className="text-[10px] opacity-70">
              (Ayat {firstAyatOnPage}-{lastAyatOnPage})
            </span>
            <SlidersHorizontal className="w-3 h-3 opacity-60 ml-0.5" />
          </button>

          {/* Next Page Pill */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Halaman Berikutnya"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ChevronRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </button>

          {/* Quick Font Size Adjustment Button */}
          <button
            onClick={() => setShowFontModal(true)}
            title="Ubah Ukuran Huruf"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${themeClasses.cardElevated} hover:text-emerald-500`}
          >
            <Type className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Kembali ke atas"
          className="fixed bottom-20 right-4 z-30 p-2.5 rounded-full bg-emerald-600 text-white shadow-lg active:scale-90 transition-all hover:bg-emerald-700"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* iOS QUICK JUMP BOTTOM SHEET / MODAL */}
      {showJumpModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3 animate-fadeIn">
          <div
            className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl transition-all ${
              theme === 'dark'
                ? 'bg-[#1C1C1E] border-[#2C2C2E]'
                : theme === 'sepia'
                ? 'bg-[#F2E8D2] border-[#DECFA9]'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className={`text-sm font-bold ${themeClasses.textPrimary}`}>
                Lompat ke Ayat atau Halaman
              </h3>
              <button
                onClick={() => setShowJumpModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Jump by Ayah Input */}
            <form onSubmit={handleJumpToAyat} className="mt-4 space-y-3">
              <div>
                <label className={`text-xs font-semibold ${themeClasses.textSecondary} block mb-1.5`}>
                  Nomor Ayat (1 - {surah.jumlahAyat}):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max={surah.jumlahAyat}
                    value={jumpAyatInput}
                    onChange={(e) => setJumpAyatInput(e.target.value)}
                    placeholder={`Contoh: 10`}
                    autoFocus
                    className={`flex-1 px-3.5 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${themeClasses.inputBg}`}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl active:scale-95 transition-transform"
                  >
                    Lompat
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Page Picker Grid */}
            <div className="mt-5 pt-3 border-t border-gray-200 dark:border-gray-800">
              <label className={`text-xs font-semibold ${themeClasses.textSecondary} block mb-2`}>
                Pilih Halaman Langsung:
              </label>
              <div className="grid grid-cols-5 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => {
                      handlePageChange(pg);
                      setShowJumpModal(false);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentPage === pg
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : `${themeClasses.cardElevated} ${themeClasses.textPrimary} hover:border-emerald-500`
                    }`}
                  >
                    {pg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK FONT ADJUSTMENT MODAL */}
      {showFontModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3 animate-fadeIn">
          <div
            className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl transition-all ${
              theme === 'dark'
                ? 'bg-[#1C1C1E] border-[#2C2C2E]'
                : theme === 'sepia'
                ? 'bg-[#F2E8D2] border-[#DECFA9]'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className={`text-sm font-bold ${themeClasses.textPrimary}`}>
                Ukuran Huruf Arab ({arabicFontSize}px)
              </h3>
              <button
                onClick={() => setShowFontModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div
                className={`p-3 rounded-xl border text-right font-arabic select-none ${
                  theme === 'dark'
                    ? 'bg-[#141416] border-[#2A2A2D]'
                    : theme === 'sepia'
                    ? 'bg-[#E5DAC0]/50 border-[#DECFA9]'
                    : 'bg-emerald-50/40 border-emerald-100'
                }`}
                dir="rtl"
              >
                <p
                  className="text-emerald-600 dark:text-emerald-400 transition-all leading-relaxed"
                  style={{ fontSize: `${arabicFontSize}px` }}
                >
                  بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-gray-400">A-</span>
                <input
                  type="range"
                  min="22"
                  max="38"
                  step="2"
                  value={arabicFontSize}
                  onChange={(e) => setArabicFontSize(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-base font-bold text-gray-400">A+</span>
              </div>

              <button
                onClick={() => setShowFontModal(false)}
                className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
