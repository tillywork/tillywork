export const useThemeStore = defineStore('theme', {
  persist: true,
  state: () => {
    return {
      theme: usePreferredDark() ? 'dark' : 'light',
    };
  },
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
    },
  },
});
