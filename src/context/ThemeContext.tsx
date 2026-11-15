import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeMode } from '../types/quran';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  arabicFontSize: number;
  setArabicFontSize: (size: number) => void;
  showLatin: boolean;
  setShowLatin: (show: boolean) => void;
  showTranslation: boolean;
  setShowTranslation: (show: boolean) => void;
}

const THEME_KEY = 'quran_app_theme';
const FONT_SIZE_KEY = 'quran_app_font_size';
const SHOW_LATIN_KEY = 'quran_app_show_latin';
const SHOW_TRANS_KEY = 'quran_app_show_trans';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode;
    if (saved === 'dark' || saved === 'sepia' || saved === 'light') return saved;
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [arabicFontSize, setArabicFontSizeState] = useState<number>(() => {
    const saved = localStorage.getItem(FONT_SIZE_KEY);
    return saved ? parseInt(saved, 10) : 28; // Default 28px for Arabic
  });

  const [showLatin, setShowLatinState] = useState<boolean>(() => {
    const saved = localStorage.getItem(SHOW_LATIN_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  const [showTranslation, setShowTranslationState] = useState<boolean>(() => {
    const saved = localStorage.getItem(SHOW_TRANS_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  const setArabicFontSize = (size: number) => {
    setArabicFontSizeState(size);
    localStorage.setItem(FONT_SIZE_KEY, size.toString());
  };

  const setShowLatin = (show: boolean) => {
    setShowLatinState(show);
    localStorage.setItem(SHOW_LATIN_KEY, show.toString());
  };

  const setShowTranslation = (show: boolean) => {
    setShowTranslationState(show);
    localStorage.setItem(SHOW_TRANS_KEY, show.toString());
  };

  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-sepia');
    document.body.classList.add(`theme-${theme}`);

    // Update meta theme-color for iOS / Android status bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      if (theme === 'dark') {
        metaThemeColor.setAttribute('content', '#000000');
      } else if (theme === 'sepia') {
        metaThemeColor.setAttribute('content', '#F5EEDB');
      } else {
        metaThemeColor.setAttribute('content', '#F2F2F7');
      }
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        arabicFontSize,
        setArabicFontSize,
        showLatin,
        setShowLatin,
        showTranslation,
        setShowTranslation,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
