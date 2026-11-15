import React from 'react';
import { BookOpen, Sparkles, Bell, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getThemeClasses } from '../utils/themeClasses';

export type TabType = 'surah' | 'routine' | 'notifications' | 'settings';

interface TabBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ currentTab, onTabChange }) => {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'surah', label: 'Al-Quran', icon: BookOpen },
    { id: 'routine', label: 'Rutinitas', icon: Sparkles },
    { id: 'notifications', label: 'Pengingat', icon: Bell },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 px-4 pointer-events-none">
      <nav
        className={`max-w-md mx-auto pointer-events-auto rounded-full p-1.5 border shadow-xl shadow-black/10 dark:shadow-black/50 transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-[#18181A]/90 backdrop-blur-2xl border-[#2C2C2E]'
            : theme === 'sepia'
            ? 'bg-[#F2E8D2]/95 backdrop-blur-2xl border-[#DECFA9]'
            : 'bg-white/90 backdrop-blur-2xl border-gray-200/80 shadow-gray-200/50'
        }`}
      >
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-full transition-all duration-200 active:scale-90 relative ${
                  isActive
                    ? theme === 'dark'
                      ? 'bg-[#2C2C2E] text-emerald-400 font-semibold'
                      : theme === 'sepia'
                      ? 'bg-[#E3D3B1] text-[#78350F] font-semibold'
                      : 'bg-emerald-50 text-emerald-700 font-semibold'
                    : themeClasses.inactiveTab
                }`}
              >
                <div className="relative">
                  <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  {tab.id === 'routine' && (
                    <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
