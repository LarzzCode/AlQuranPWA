import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Type,
  Share,
  Download,
  Trash2,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getThemeClasses } from '../utils/themeClasses';

export const SettingsView: React.FC = () => {
  const {
    theme,
    setTheme,
    arabicFontSize,
    setArabicFontSize,
    showLatin,
    setShowLatin,
    showTranslation,
    setShowTranslation,
  } = useTheme();

  const themeClasses = getThemeClasses(theme);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  useEffect(() => {
    // Check if launched as PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(isPWA);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert('Untuk pengguna iPhone/iPad: Tekan ikon Share di Safari lalu pilih "Tambahkan ke Layar Utama".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Bersihkan data cache offline? Aplikasi akan mengunduh ulang data saat tersambung internet.')) {
      localStorage.removeItem('quran_surah_list_cache');
      // clear detail keys
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('quran_surah_detail_')) {
          localStorage.removeItem(key);
        }
      });
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 2500);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-fadeIn">
      {/* Title Header */}
      <div
        className={`p-5 rounded-3xl border transition-all ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-[#1C1C1E] to-[#121214] border-[#2C2C2E]'
            : theme === 'sepia'
            ? 'bg-gradient-to-br from-[#EFE5CC] to-[#E5DAC0] border-[#DECFA9]'
            : 'bg-gradient-to-br from-white to-emerald-50/50 border-gray-200/80 shadow-sm'
        }`}
      >
        <h2 className={`text-xl font-bold tracking-tight ${themeClasses.textPrimary}`}>
          Pengaturan & Personalisasi
        </h2>
        <p className={`text-xs mt-1 leading-relaxed ${themeClasses.textSecondary}`}>
          Sesuaikan tema visual, ukuran font mushaf, dan preferensi membaca Anda.
        </p>
      </div>

      {/* 3 Theme Modes Selection */}
      <div className={`p-4 rounded-2xl border space-y-3 ${themeClasses.cardBg}`}>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold uppercase tracking-wider ${themeClasses.textSecondary}`}>
            Mode Tampilan (3 Pilihan)
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
            {theme === 'light' ? 'Mode Terang' : theme === 'sepia' ? 'Mode Sepia' : 'Mode Gelap'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Light Theme Button */}
          <button
            onClick={() => setTheme('light')}
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all active:scale-95 ${
              theme === 'light'
                ? 'ring-2 ring-emerald-500 border-emerald-500 bg-white shadow-sm'
                : 'bg-white/80 border-gray-200 text-gray-700'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-gray-900">Terang</span>
          </button>

          {/* Sepia Theme Button */}
          <button
            onClick={() => setTheme('sepia')}
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all active:scale-95 ${
              theme === 'sepia'
                ? 'ring-2 ring-[#92400E] border-[#92400E] bg-[#F5EEDB] shadow-sm'
                : 'bg-[#EDE4CD] border-[#DECFA9] text-[#5A452E]'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[#92400E]/15 text-[#92400E] flex items-center justify-center font-bold text-xs">
              <span className="w-3.5 h-3.5 rounded-full bg-[#C29D5D] border border-[#A47F42]" />
            </div>
            <span className="text-xs font-bold text-[#3D2E1E]">Sepia</span>
          </button>

          {/* Dark Theme Button */}
          <button
            onClick={() => setTheme('dark')}
            className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition-all active:scale-95 ${
              theme === 'dark'
                ? 'ring-2 ring-emerald-400 border-emerald-400 bg-[#1C1C1E] shadow-sm'
                : 'bg-[#141416] border-[#2C2C2E] text-gray-300'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white">Gelap</span>
          </button>
        </div>
      </div>

      {/* Font Size Adjuster */}
      <div className={`p-4 rounded-2xl border space-y-3 ${themeClasses.cardBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Type className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className={`text-xs font-bold uppercase tracking-wider ${themeClasses.textSecondary}`}>
              Ukuran Huruf Arab
            </h4>
          </div>
          <span className={`text-xs font-bold ${themeClasses.textPrimary}`}>
            {arabicFontSize}px
          </span>
        </div>

        {/* Live Arabic Font Preview */}
        <div
          className={`p-3.5 rounded-xl border text-right font-arabic select-none ${
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

        {/* Range Slider */}
        <div className="flex items-center space-x-3 pt-1">
          <span className="text-xs font-medium text-gray-400">A-</span>
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
      </div>

      {/* Display Options Toggles */}
      <div className={`p-4 rounded-2xl border space-y-3.5 ${themeClasses.cardBg}`}>
        <h4 className={`text-xs font-bold uppercase tracking-wider ${themeClasses.textSecondary}`}>
          Opsi Tampilan Bacaan
        </h4>

        {/* Latin Transliteration Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-semibold ${themeClasses.textPrimary}`}>
              Teks Latin (Transliterasi)
            </p>
            <p className={`text-xs ${themeClasses.textSecondary}`}>
              Menampilkan bacaan latin di bawah tulisan Arab
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showLatin}
              onChange={(e) => setShowLatin(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Indonesian Translation Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <div>
            <p className={`text-sm font-semibold ${themeClasses.textPrimary}`}>
              Terjemahan Bahasa Indonesia
            </p>
            <p className={`text-xs ${themeClasses.textSecondary}`}>
              Menampilkan arti ayat standar Kemenag RI
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showTranslation}
              onChange={(e) => setShowTranslation(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>

      {/* PWA Installation & Experience */}
      <div className={`p-4 rounded-2xl border space-y-3 ${themeClasses.cardBg}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${themeClasses.textPrimary}`}>
                Install Web App (PWA)
              </h4>
              <p className={`text-xs ${themeClasses.textSecondary}`}>
                {isStandalone
                  ? 'Aplikasi sudah terpasang di Layar Utama'
                  : 'Pasang ke iPhone/Android untuk pengalaman full-screen tanpa address bar'}
              </p>
            </div>
          </div>
        </div>

        {!isStandalone && (
          <div
            className={`p-3 rounded-xl text-xs space-y-2 border ${
              theme === 'dark'
                ? 'bg-[#161618] border-[#2A2A2D]'
                : theme === 'sepia'
                ? 'bg-[#E5DAC0]/50 border-[#DECFA9]'
                : 'bg-emerald-50/60 border-emerald-100'
            }`}
          >
            <div className="flex items-start space-x-2">
              <Share className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className={themeClasses.textSecondary}>
                <strong>Pengguna iOS (Safari):</strong> Ketuk tombol <em>Share</em> di bawah layar browser, lalu geser dan pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <Download className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className={themeClasses.textSecondary}>
                <strong>Pengguna Android (Chrome):</strong> Ketuk tombol titik tiga di kanan atas, lalu pilih <strong>"Install aplikasi"</strong> atau tombol di bawah ini:
              </p>
            </div>

            <button
              onClick={handleInstallApp}
              className="w-full py-2 bg-emerald-600 text-white rounded-xl font-semibold text-xs active:scale-95 transition-all shadow-sm"
            >
              Pasang Sekarang
            </button>
          </div>
        )}
      </div>

      {/* Offline Storage & Cache management */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between ${themeClasses.cardBg}`}>
        <div>
          <h4 className={`text-sm font-bold ${themeClasses.textPrimary}`}>
            Cache Offline
          </h4>
          <p className={`text-xs ${themeClasses.textSecondary}`}>
            Surat yang pernah Anda buka otomatis tersimpan untuk dibaca tanpa kuota.
          </p>
        </div>
        <button
          onClick={handleClearCache}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 active:scale-95 transition-all"
        >
          {cacheCleared ? <Check className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
          <span>{cacheCleared ? 'Bersih!' : 'Bersihkan'}</span>
        </button>
      </div>

      {/* Privacy & Ad-Free Guarantee Card */}
      <div
        className={`p-4 rounded-2xl border flex items-start space-x-3 text-xs leading-relaxed ${
          theme === 'dark'
            ? 'bg-[#141416] border-[#252528] text-gray-400'
            : theme === 'sepia'
            ? 'bg-[#E5DAC0]/40 border-[#DECFA9] text-[#6A5741]'
            : 'bg-emerald-50/40 border-emerald-100 text-emerald-800'
        }`}
      >
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-emerald-700 dark:text-emerald-300">
            Jaminan Bebas Iklan 100% Selamanya
          </p>
          <p className="mt-0.5">
            Aplikasi ini dibuat khusus untuk kekhusyuan ibadah Anda tanpa banner, pop-up, tracker, atau iklan pihak ketiga yang mengganggu.
          </p>
        </div>
      </div>
    </div>
  );
};
