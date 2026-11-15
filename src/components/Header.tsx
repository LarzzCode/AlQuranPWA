import React from 'react';
import { ChevronLeft, Moon, Sun, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getThemeClasses } from '../utils/themeClasses';
import type { ThemeMode } from '../types/quran';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Quran Pribadi',
  subtitle,
  onBack,
  showBack = false,
}) => {
  const { theme, setTheme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const cycleTheme = () => {
    const sequence: ThemeMode[] = ['light', 'sepia', 'dark'];
    const currentIndex = sequence.indexOf(theme);
    const nextIndex = (currentIndex + 1) % sequence.length;
    setTheme(sequence[nextIndex]);
  };

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-200 border-b ${themeClasses.navBg} ${themeClasses.border}`}>
      <div className="max-w-2xl mx-auto px-4 pt-safe">
        <div className="h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {showBack ? (
              <button
                onClick={onBack}
                aria-label="Kembali"
                className="flex items-center -ml-2 px-2 py-1.5 rounded-lg active:scale-95 transition-transform text-emerald-600 dark:text-emerald-400 font-medium text-sm"
              >
                <ChevronLeft className="w-5 h-5 mr-0.5" />
                <span>Daftar</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h1 className={`text-base font-semibold leading-tight tracking-tight ${themeClasses.textPrimary}`}>
                    Quran Pribadi
                  </h1>
                  <p className={`text-[11px] leading-none ${themeClasses.textSecondary}`}>
                    Bebas Iklan • Khusyu'
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Center Title when in reader mode */}
          {showBack && (
            <div className="flex-1 text-center px-2 truncate">
              <h1 className={`text-sm font-semibold truncate ${themeClasses.textPrimary}`}>
                {title}
              </h1>
              {subtitle && (
                <p className={`text-[11px] truncate ${themeClasses.textSecondary}`}>
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Theme Quick Switcher Pill (iOS Segmented style) */}
          <div className="flex items-center">
            <button
              onClick={cycleTheme}
              title={`Ubah Mode (Saat ini: ${theme === 'light' ? 'Terang' : theme === 'sepia' ? 'Sepia' : 'Gelap'})`}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-90 ${
                theme === 'dark'
                  ? 'bg-[#2C2C2E] border-[#3A3A3C] text-yellow-400'
                  : theme === 'sepia'
                  ? 'bg-[#E3D3B1] border-[#D6C197] text-[#78350F]'
                  : 'bg-gray-100 border-gray-200 text-gray-700'
              }`}
            >
              {theme === 'light' && (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[11px]">Terang</span>
                </>
              )}
              {theme === 'sepia' && (
                <>
                  <span className="w-3.5 h-3.5 rounded-full bg-[#C29D5D] inline-block border border-[#A47F42]" />
                  <span className="text-[11px]">Sepia</span>
                </>
              )}
              {theme === 'dark' && (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-300" />
                  <span className="text-[11px]">Gelap</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
