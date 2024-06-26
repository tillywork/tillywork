import type { WorkspaceTypes } from '@/components/project-management/workspaces/types';

export const useStateStore = defineStore('state', {
  persist: true,
  state: () => {
    return {
      selectedModule: null as null | WorkspaceTypes,
      /** Is an input currently focused */
      isInputFocused: false,
      /** Is information navigation drawer open */
      isInfoDrawerOpen: true,
    };
  },
  actions: {
    setSelectedModule(module: WorkspaceTypes) {
      this.selectedModule = module;
    },
    setIsInputFocused(v: boolean) {
      this.isInputFocused = v;
    },
    toggleInfoDrawer() {
      this.isInfoDrawerOpen = !this.isInfoDrawerOpen;
    },
  },
});
