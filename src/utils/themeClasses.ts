import type { ThemeMode } from '../types/quran';

export function getThemeClasses(theme: ThemeMode) {
  switch (theme) {
    case 'dark':
      return {
        bg: 'bg-black text-[#F2F2F7]',
        cardBg: 'bg-[#1C1C1E] border-[#2C2C2E]',
        cardElevated: 'bg-[#2C2C2E]',
        inputBg: 'bg-[#1C1C1E] border-[#3A3A3C] text-white placeholder-gray-500',
        navBg: 'bg-black/80 backdrop-blur-xl border-[#2C2C2E]',
        tabBg: 'bg-black/90 backdrop-blur-xl border-[#2C2C2E]',
        textPrimary: 'text-white',
        textSecondary: 'text-[#8E8E93]',
        textArabic: 'text-emerald-400',
        badgeBg: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/50',
        border: 'border-[#2C2C2E]',
        activeTab: 'text-emerald-400',
        inactiveTab: 'text-[#8E8E93]',
      };
    case 'sepia':
      return {
        bg: 'bg-[#F5EEDB] text-[#3D2E1E]',
        cardBg: 'bg-[#EDE4CD] border-[#DECFA9]',
        cardElevated: 'bg-[#E5DAC0]',
        inputBg: 'bg-[#EDE4CD] border-[#DECFA9] text-[#3D2E1E] placeholder-[#8A7966]',
        navBg: 'bg-[#F5EEDB]/85 backdrop-blur-xl border-[#DECFA9]',
        tabBg: 'bg-[#F5EEDB]/90 backdrop-blur-xl border-[#DECFA9]',
        textPrimary: 'text-[#3D2E1E]',
        textSecondary: 'text-[#7D6853]',
        textArabic: 'text-[#8C4307]',
        badgeBg: 'bg-[#E3D3B1] text-[#78350F] border-[#D6C197]',
        border: 'border-[#DECFA9]',
        activeTab: 'text-[#92400E]',
        inactiveTab: 'text-[#8A7966]',
      };
    case 'light':
    default:
      return {
        bg: 'bg-[#F2F2F7] text-[#1C1C1E]',
        cardBg: 'bg-white border-gray-200/80 shadow-sm',
        cardElevated: 'bg-gray-50',
        inputBg: 'bg-white border-gray-200 text-gray-900 placeholder-gray-400',
        navBg: 'bg-white/80 backdrop-blur-xl border-gray-200/70',
        tabBg: 'bg-white/90 backdrop-blur-xl border-gray-200/70',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-500',
        textArabic: 'text-emerald-700',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        border: 'border-gray-200/70',
        activeTab: 'text-emerald-600',
        inactiveTab: 'text-gray-400',
      };
  }
}
