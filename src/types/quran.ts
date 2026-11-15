export type ThemeMode = 'light' | 'dark' | 'sepia';

export interface SurahSummary {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull?: Record<string, string>;
}

export interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio?: Record<string, string>;
}

export interface SurahDetail {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull?: Record<string, string>;
  ayat: Ayat[];
  suratSelanjutnya?: false | {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
  };
  suratSebelumnya?: false | {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
  };
}

export interface Bookmark {
  surahNumber: number;
  surahName: string;
  ayatNumber: number;
  updatedAt: string;
}

export interface RoutineItem {
  id: string;
  title: string;
  arabicTitle: string;
  subtitle: string;
  timeType: 'morning' | 'night';
  surahNumber: number;
  ayatStart?: number;
  ayatEnd?: number;
  fadhilah: string;
}

export interface NotificationSettings {
  enabled: boolean;
  morningTime: string; // e.g. "06:00"
  nightTime: string;   // e.g. "20:30"
  morningActive: boolean;
  nightActive: boolean;
}
