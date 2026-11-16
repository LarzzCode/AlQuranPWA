import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import type { TabType } from './components/TabBar';
import { SurahList } from './components/SurahList';
import { SurahReader } from './components/SurahReader';
import { RoutineView } from './components/RoutineView';
import { RoutineBanner } from './components/RoutineBanner';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { fetchAllSurahs, fetchSurahDetail } from './services/quranApi';
import { startNotificationScheduler } from './services/notificationService';
import type { SurahSummary, SurahDetail, Bookmark, RoutineItem } from './types/quran';
import { useTheme } from './context/ThemeContext';
import { getThemeClasses } from './utils/themeClasses';
import { DAILY_ROUTINES } from './data/routines';

const BOOKMARK_KEY = 'quran_app_last_read_v1';

export const App: React.FC = () => {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const [currentTab, setCurrentTab] = useState<TabType>('surah');
  const [surahs, setSurahs] = useState<SurahSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Reader state
  const [activeSurahDetail, setActiveSurahDetail] = useState<SurahDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [readerAyatRange, setReaderAyatRange] = useState<{ start?: number; end?: number } | null>(null);

  // Reader modals state triggered from header
  const [showReaderFontModal, setShowReaderFontModal] = useState(false);
  const [showReaderJumpModal, setShowReaderJumpModal] = useState(false);

  // Last read bookmark
  const [lastRead, setLastRead] = useState<Bookmark | null>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARK_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Load all Surahs on start
  const loadSurahs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllSurahs();
      setSurahs(data);
    } catch (err: any) {
      setError('Gagal memuat daftar surat. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurahs();
    startNotificationScheduler();

    // Check URL search parameters (e.g., if opened via notification click)
    const params = new URLSearchParams(window.location.search);
    const routineParam = params.get('routine');
    if (routineParam) {
      const routine = DAILY_ROUTINES.find((r) => r.id === routineParam);
      if (routine) {
        handleSelectRoutine(routine);
      }
    }
  }, []);

  // Open Surah reader
  const handleSelectSurah = async (surahNumber: number, ayatStart?: number, ayatEnd?: number) => {
    setLoadingDetail(true);
    setReaderAyatRange(ayatStart ? { start: ayatStart, end: ayatEnd } : null);
    try {
      const detail = await fetchSurahDetail(surahNumber);
      setActiveSurahDetail(detail);
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch (err: any) {
      alert('Gagal membuka surat. Silakan coba lagi.');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open routine
  const handleSelectRoutine = (routine: RoutineItem) => {
    handleSelectSurah(routine.surahNumber, routine.ayatStart, routine.ayatEnd);
  };

  // Save Bookmark
  const handleSaveBookmark = (bm: Bookmark) => {
    setLastRead(bm);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bm));
  };

  const handleBackToList = () => {
    setActiveSurahDetail(null);
    setReaderAyatRange(null);
    setShowReaderFontModal(false);
    setShowReaderJumpModal(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${themeClasses.bg}`}>
      {/* Top Header */}
      <Header
        showBack={!!activeSurahDetail}
        title={activeSurahDetail ? activeSurahDetail.namaLatin : 'Quran Pribadi'}
        subtitle={
          activeSurahDetail
            ? `${activeSurahDetail.arti} • ${activeSurahDetail.jumlahAyat} Ayat`
            : undefined
        }
        onBack={handleBackToList}
        onOpenFontModal={() => setShowReaderFontModal(true)}
        onOpenJumpModal={() => setShowReaderJumpModal(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto px-4 py-3 pb-24">
        {/* In-App Routine Notification Banner on Home */}
        {!activeSurahDetail && <RoutineBanner onSelectRoutine={handleSelectRoutine} />}

        {loadingDetail && (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className={`text-xs font-semibold ${themeClasses.textSecondary}`}>
              Membuka mushaf...
            </p>
          </div>
        )}

        {!loadingDetail && activeSurahDetail ? (
          <SurahReader
            surah={activeSurahDetail}
            onNavigateSurah={(num) => handleSelectSurah(num)}
            onSaveBookmark={handleSaveBookmark}
            currentBookmark={lastRead}
            targetAyatStart={readerAyatRange?.start}
            targetAyatEnd={readerAyatRange?.end}
            showFontModalExternal={showReaderFontModal}
            setShowFontModalExternal={setShowReaderFontModal}
            showJumpModalExternal={showReaderJumpModal}
            setShowJumpModalExternal={setShowReaderJumpModal}
          />
        ) : (
          !loadingDetail && (
            <>
              {currentTab === 'surah' && (
                <SurahList
                  surahs={surahs}
                  loading={loading}
                  error={error}
                  onSelectSurah={(num) => handleSelectSurah(num)}
                  onSelectRoutine={handleSelectRoutine}
                  onRetry={loadSurahs}
                  lastRead={lastRead}
                />
              )}

              {currentTab === 'routine' && (
                <RoutineView onSelectRoutine={handleSelectRoutine} />
              )}

              {currentTab === 'notifications' && <NotificationsView />}

              {currentTab === 'settings' && <SettingsView />}
            </>
          )
        )}
      </main>

      {/* Bottom iOS Floating Island Tab Bar (visible when not reading) */}
      {!activeSurahDetail && (
        <TabBar currentTab={currentTab} onTabChange={(tab) => setCurrentTab(tab)} />
      )}
    </div>
  );
};
