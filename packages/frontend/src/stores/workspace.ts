import type { Space } from '@/modules/project-management/spaces/types';
import type { Workspace } from '@/modules/project-management/workspaces/types';
import { defineStore } from 'pinia';

export const useWorkspaceStore = defineStore('workspace', {
  persist: true,
  state: () => {
    return {
      selectedWorkspace: null as Workspace | null,
      selectedSpace: null as Space | null,
    };
  },
  actions: {
    setSelectedWorkspace(workspace: Workspace) {
      this.selectedWorkspace = workspace;
    },
    setSelectedSpace(space: Space) {
      this.selectedSpace = space;
    },
  },
});
