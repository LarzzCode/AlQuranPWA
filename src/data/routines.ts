import type { RoutineItem } from '../types/quran';

export const DAILY_ROUTINES: RoutineItem[] = [
  {
    id: 'waqiah',
    title: "Al-Waqi'ah",
    arabicTitle: 'الواقعة',
    subtitle: 'Rutinitas Pagi • Pembuka Rezeki & Berkah',
    timeType: 'morning',
    surahNumber: 56,
    fadhilah: 'Membaca surat Al-Waqiah setiap hari/pagi menjadi pelindung dari kefakiran serta pembuka pintu rezeki dan keberkahan hidup.'
  },
  {
    id: 'mulk',
    title: 'Al-Mulk',
    arabicTitle: 'الملك',
    subtitle: 'Rutinitas Malam • Penyelamat Siksa Kubur',
    timeType: 'night',
    surahNumber: 67,
    fadhilah: 'Surat pelindung dan pembela pembacanya di alam kubur hingga diampuni segala dosanya.'
  },
  {
    id: 'baqarah_last3',
    title: '3 Ayat Terakhir Al-Baqarah',
    arabicTitle: 'اٰخِرُ سُوْرَةِ الْبَقَرَةِ',
    subtitle: 'Rutinitas Malam • Ayat 284 - 286 (Kecukupan & Perlindungan)',
    timeType: 'night',
    surahNumber: 2,
    ayatStart: 284,
    ayatEnd: 286,
    fadhilah: 'Rasulullah ﷺ bersabda: "Siapa yang membaca ayat-ayat terakhir dari surat Al-Baqarah pada suatu malam, niscaya telah mencukupinya (dari segala marabahaya & keburukan)." (HR. Bukhari & Muslim)'
  }
];
