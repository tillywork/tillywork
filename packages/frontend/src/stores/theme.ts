export const useThemeStore = defineStore('theme', {
  persist: true,
  state: () => {
    return {
      theme: 'light',
    };
  },
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
    },
  },
});
