export const useThemeStore = defineStore('theme', {
  persist: true,
  state: () => {
    return {
      theme: 'dark',
    };
  },
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
    },
  },
});
