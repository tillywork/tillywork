import type { WorkspaceTypes } from '@/components/project-management/workspaces/types';
import { defineStore } from 'pinia';

export const useStateStore = defineStore('state', {
  persist: true,
  state: () => {
    return {
      selectedModule: null as null | WorkspaceTypes,
    };
  },
  actions: {
    setSelectedModule(module: WorkspaceTypes) {
      this.selectedModule = module;
    },
  },
});
