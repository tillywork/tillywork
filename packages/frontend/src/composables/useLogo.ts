import { useThemeStore } from '@/stores/theme';

export const useLogo = () => {
  const themeStore = useThemeStore();

  function getLogoUrlByTheme() {
    if (themeStore.theme === 'dark') {
      return 'https://cdn.tilly.work/logo-white.png';
    } else {
      return 'https://cdn.tilly.work/logo-black.png';
    }
  }

  return {
    getLogoUrlByTheme,
  };
};
