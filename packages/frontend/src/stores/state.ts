import type { List } from '@/components/project-management/lists/types';
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
      /** Sets the latest active list */
      currentList: undefined as undefined | List,
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
    setCurrentList(list: undefined | List) {
      this.currentList = list;
    },
  },
});
