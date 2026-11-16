import type { NotificationSettings } from '../types/quran';

const SETTINGS_KEY = 'quran_app_notifications_v1';

export const defaultNotificationSettings: NotificationSettings = {
  enabled: false,
  morningTime: '06:00',
  nightTime: '20:30',
  morningActive: true,
  nightActive: true,
};

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...defaultNotificationSettings, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Error reading notification settings', e);
  }
  return defaultNotificationSettings;
}

export function saveNotificationSettings(settings: NotificationSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Error saving notification settings', e);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    if (isIOS() && !isStandalonePWA()) {
      alert(
        'Khusus iPhone / iPad: Apple mewajibkan web app ditambahkan ke Layar Utama (Add to Home Screen) terlebih dahulu agar notifikasi dapat diaktifkan.\n\nSilakan tekan tombol Share di Safari lalu pilih "Tambahkan ke Layar Utama".'
      );
    } else {
      alert('Browser Anda belum mendukung Web Notification.');
    }
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      console.warn('Error requesting notification permission', e);
      return false;
    }
  }

  return false;
}

export async function sendLocalNotification(title: string, body: string, urlPath: string = '/') {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const options: NotificationOptions = {
    body,
    icon: '/quran-icon.svg',
    badge: '/quran-icon.svg',
    data: { url: urlPath },
  };

  // Crucial for iOS: new Notification() throws an error in iOS Safari!
  // It MUST be delivered through the Service Worker registration.
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, options);
        return;
      }
    } catch (swErr) {
      console.warn('ServiceWorker showNotification failed, trying fallback', swErr);
    }
  }

  // Fallback for desktop / standard browsers
  try {
    new Notification(title, options);
  } catch (err) {
    console.warn('Desktop Notification fallback failed', err);
  }
}

// Background scheduler checker
let timerId: number | null = null;
let lastTriggeredDate = '';

export function startNotificationScheduler() {
  if (timerId) clearInterval(timerId);

  // Check every 25 seconds
  timerId = window.setInterval(() => {
    const settings = getNotificationSettings();
    if (!settings.enabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;
    const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    // Morning check
    if (settings.morningActive && currentTimeStr === settings.morningTime) {
      const triggerKey = `morning_${todayStr}`;
      if (lastTriggeredDate !== triggerKey) {
        lastTriggeredDate = triggerKey;
        sendLocalNotification(
          "Waktunya Membaca Al-Waqi'ah 🌅",
          "Awali pagi Anda dengan keberkahan surat Al-Waqiah pembuka pintu rezeki.",
          '/?routine=waqiah'
        );
      }
    }

    // Night check
    if (settings.nightActive && currentTimeStr === settings.nightTime) {
      const triggerKey = `night_${todayStr}`;
      if (lastTriggeredDate !== triggerKey) {
        lastTriggeredDate = triggerKey;
        sendLocalNotification(
          "Rutinitas Malam: Al-Mulk & Akhir Al-Baqarah 🌙",
          "Tenangkan hati sebelum tidur dengan Al-Mulk & 3 ayat terakhir Al-Baqarah.",
          '/?routine=mulk'
        );
      }
    }
  }, 25000);
}
