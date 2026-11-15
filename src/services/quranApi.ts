import type { SurahDetail, SurahSummary } from '../types/quran';

const BASE_URL = 'https://equran.id/api/v2';
const SURAH_LIST_CACHE_KEY = 'quran_surah_list_cache';
const SURAH_DETAIL_CACHE_PREFIX = 'quran_surah_detail_';

export async function fetchAllSurahs(): Promise<SurahSummary[]> {
  // Check localStorage cache first for instant load
  try {
    const cached = localStorage.getItem(SURAH_LIST_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length === 114) {
        // Return cached immediately, and optionally revalidate in background
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading surah cache', e);
  }

  try {
    const response = await fetch(`${BASE_URL}/surat`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    if (json.code === 200 && Array.isArray(json.data)) {
      try {
        localStorage.setItem(SURAH_LIST_CACHE_KEY, JSON.stringify(json.data));
      } catch (e) {
        console.warn('Storage limit reached for surah list', e);
      }
      return json.data;
    }
    throw new Error('Format data tidak sesuai');
  } catch (error) {
    // If offline and cache exists, fallback
    const cached = localStorage.getItem(SURAH_LIST_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
    throw error;
  }
}

export async function fetchSurahDetail(nomor: number): Promise<SurahDetail> {
  const cacheKey = `${SURAH_DETAIL_CACHE_PREFIX}${nomor}`;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.nomor === nomor && parsed.ayat) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading surah detail cache', e);
  }

  try {
    const response = await fetch(`${BASE_URL}/surat/${nomor}`);
    if (!response.ok) {
      throw new Error(`Gagal memuat surah ${nomor}: ${response.status}`);
    }
    const json = await response.json();
    if (json.code === 200 && json.data) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(json.data));
      } catch (e) {
        console.warn('Storage quota exceeded, caching skipped for detail', e);
      }
      return json.data;
    }
    throw new Error('Data surat tidak ditemukan');
  } catch (error) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    throw error;
  }
}
