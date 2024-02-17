import { useThemeStore } from '@/stores/theme';

export const useTheme = () => {
  const { theme, toggleTheme } = useThemeStore();

  return {
    theme,
    toggleTheme,
  };
};
