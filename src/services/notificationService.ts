import type { NotificationSettings } from '../types/quran';

const SETTINGS_KEY = 'quran_app_notifications_v1';

export const defaultNotificationSettings: NotificationSettings = {
  enabled: false,
  morningTime: '06:00',
  nightTime: '20:30',
  morningActive: true,
  nightActive: true,
};

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
    alert('Browser Anda belum mendukung Web Notification.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendLocalNotification(title: string, body: string, urlPath: string = '/') {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const options: NotificationOptions = {
    body,
    icon: '/quran-icon.svg',
    badge: '/quran-icon.svg',
    data: { url: urlPath },
  };

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, options);
    });
  } else {
    new Notification(title, options);
  }
}

// Background scheduler checker
let timerId: number | null = null;
let lastTriggeredDate = '';

export function startNotificationScheduler() {
  if (timerId) clearInterval(timerId);

  // Check every 30 seconds
  timerId = window.setInterval(() => {
    const settings = getNotificationSettings();
    if (!settings.enabled || Notification.permission !== 'granted') {
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
          "Awali pagi Anda dengan keberkahan surat Al-Waqiah untuk membuka pintu rezeki.",
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
          "Tenangkan hati sebelum tidur dengan Al-Mulk (penyelamat kubur) & 3 ayat terakhir Al-Baqarah.",
          '/?routine=mulk'
        );
      }
    }
  }, 30000);
}
