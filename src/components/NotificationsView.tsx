import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Sun, Moon, CheckCircle2, Sparkles, Smartphone, AlertTriangle } from 'lucide-react';
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  sendLocalNotification,
  isIOS,
  isStandalonePWA,
} from '../services/notificationService';
import type { NotificationSettings } from '../types/quran';
import { useTheme } from '../context/ThemeContext';
import { getThemeClasses } from '../utils/themeClasses';

export const NotificationsView: React.FC = () => {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings);
  const [permissionState, setPermissionState] = useState<NotificationPermission>(() => {
    return 'Notification' in window ? Notification.permission : 'default';
  });
  const [testSent, setTestSent] = useState(false);
  const [isAppleDevice, setIsAppleDevice] = useState(false);
  const [isHomeApp, setIsHomeApp] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    }
    setIsAppleDevice(isIOS());
    setIsHomeApp(isStandalonePWA());
  }, []);

  const handleToggleEnable = async () => {
    if (!settings.enabled) {
      const granted = await requestNotificationPermission();
      if ('Notification' in window) {
        setPermissionState(Notification.permission);
      }
      if (granted) {
        const next = { ...settings, enabled: true };
        setSettings(next);
        saveNotificationSettings(next);
      }
    } else {
      const next = { ...settings, enabled: false };
      setSettings(next);
      saveNotificationSettings(next);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveNotificationSettings(next);
  };

  const handleTestNotification = async () => {
    if (permissionState !== 'granted') {
      const granted = await requestNotificationPermission();
      if ('Notification' in window) setPermissionState(Notification.permission);
      if (!granted) {
        alert('Izin notifikasi belum diizinkan oleh browser Anda.');
        return;
      }
    }

    await sendLocalNotification(
      'Quran Pribadi - Uji Notifikasi Berhasil! 🔔',
      'Pengingat membaca Al-Waqiah (pagi) dan Al-Mulk / Akhir Baqarah (malam) siap menemani Anda.',
      '/'
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Header Info */}
      <div
        className={`p-5 rounded-3xl border transition-all ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-[#1C1C1E] to-[#121214] border-[#2C2C2E]'
            : theme === 'sepia'
            ? 'bg-gradient-to-br from-[#EFE5CC] to-[#E5DAC0] border-[#DECFA9]'
            : 'bg-gradient-to-br from-white to-emerald-50/50 border-gray-200/80 shadow-sm'
        }`}
      >
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
          <Bell className="w-4 h-4" />
          <span>Pengingat Rutinitas Harian</span>
        </div>
        <h2 className={`text-xl font-bold tracking-tight ${themeClasses.textPrimary}`}>
          Pengingat Waktu Membaca
        </h2>
        <p className={`text-xs mt-1 leading-relaxed ${themeClasses.textSecondary}`}>
          Atur jam notifikasi otomatis di perangkat Anda agar tidak melewatkan Surat Al-Waqi'ah di pagi hari dan Al-Mulk serta 3 ayat terakhir Al-Baqarah di malam hari.
        </p>
      </div>

      {/* iOS Standalone Warning Banner if in Safari Tab */}
      {isAppleDevice && !isHomeApp && (
        <div className="p-4 rounded-2xl border bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Syarat Notifikasi iPhone (iOS)
            </h4>
          </div>
          <p className="text-xs leading-relaxed opacity-90">
            Di iPhone, Apple <strong>hanya mengaktifkan izin notifikasi</strong> jika web ini sudah ditambahkan ke <strong>Layar Utama (Home Screen)</strong>.
          </p>
          <div className="text-[11px] space-y-1 pt-1 opacity-95">
            <p>1. Ketuk ikon <strong>Share</strong> di bar bawah Safari (ikon kotak berpanah ke atas).</p>
            <p>2. Gulir ke bawah dan ketuk <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</p>
            <p>3. Buka aplikasi dari ikon di Layar Utama HP Anda, lalu tombol notifikasi di bawah akan langsung berfungsi normal!</p>
          </div>
        </div>
      )}

      {/* Main Switch Card */}
      <div className={`p-4 rounded-2xl border ${themeClasses.cardBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                settings.enabled
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}
            >
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${themeClasses.textPrimary}`}>
                Aktifkan Notifikasi
              </h3>
              <p className={`text-xs ${themeClasses.textSecondary}`}>
                {permissionState === 'granted'
                  ? 'Izin browser: Diberikan ✓'
                  : permissionState === 'denied'
                  ? 'Izin browser: Ditolak (Buka Pengaturan HP ➔ Safari ➔ Notifikasi)'
                  : 'Ketuk saklar untuk meminta izin notifikasi'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={handleToggleEnable}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Test Notification Trigger */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className={`text-xs ${themeClasses.textSecondary}`}>
            Ingin mencoba suara / getar notifikasi?
          </span>
          <button
            onClick={handleTestNotification}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
          >
            {testSent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{testSent ? 'Terkirim!' : 'Uji Sekarang'}</span>
          </button>
        </div>
      </div>

      {/* Routine Timers */}
      <div className="space-y-3">
        {/* Morning Waqiah */}
        <div className={`p-4 rounded-2xl border ${themeClasses.cardBg}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${themeClasses.textPrimary}`}>
                  Pengingat Pagi (Al-Waqi'ah)
                </h4>
                <p className={`text-xs ${themeClasses.textSecondary}`}>
                  Pemberitahuan untuk membaca surat Al-Waqi'ah pembuka rezeki.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.morningActive}
                onChange={(e) => updateSetting('morningActive', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className={`text-xs font-medium ${themeClasses.textSecondary}`}>
              Jam Notifikasi:
            </span>
            <input
              type="time"
              value={settings.morningTime}
              onChange={(e) => updateSetting('morningTime', e.target.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${themeClasses.inputBg}`}
            />
          </div>
        </div>

        {/* Night Mulk & Baqarah */}
        <div className={`p-4 rounded-2xl border ${themeClasses.cardBg}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${themeClasses.textPrimary}`}>
                  Pengingat Malam (Al-Mulk & Akhir Al-Baqarah)
                </h4>
                <p className={`text-xs ${themeClasses.textSecondary}`}>
                  Pemberitahuan sebelum tidur untuk perlindungan malam.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.nightActive}
                onChange={(e) => updateSetting('nightActive', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className={`text-xs font-medium ${themeClasses.textSecondary}`}>
              Jam Notifikasi:
            </span>
            <input
              type="time"
              value={settings.nightTime}
              onChange={(e) => updateSetting('nightTime', e.target.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${themeClasses.inputBg}`}
            />
          </div>
        </div>
      </div>

      {/* In-App Reminder Guarantee Info */}
      <div
        className={`p-4 rounded-2xl border flex items-start space-x-3 ${
          theme === 'dark'
            ? 'bg-[#18181B] border-[#27272A]'
            : theme === 'sepia'
            ? 'bg-[#EFE5CC] border-[#DECFA9]'
            : 'bg-emerald-50/60 border-emerald-200/60'
        }`}
      >
        <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <p className="font-bold text-emerald-700 dark:text-emerald-300">
            Pengingat Visual Otomatis (In-App Banner):
          </p>
          <p className={`mt-0.5 ${themeClasses.textSecondary}`}>
            Selain notifikasi sistem, aplikasi kini dilengkapi spanduk pengingat visual otomatis di halaman depan saat Anda membuka web di waktu pagi atau malam jika belum membaca Al-Waqi'ah atau Al-Mulk hari ini.
          </p>
        </div>
      </div>
    </div>
  );
};
