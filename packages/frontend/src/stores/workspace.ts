import type { Workspace } from '@/components/project-management/workspaces/types';

export const useWorkspaceStore = defineStore('workspace', {
  persist: true,
  state: () => {
    return {
      selectedWorkspace: null as Workspace | null,
      spaceExpansionState: {} as Record<number, number[]>,
    };
  },
  actions: {
    setSelectedWorkspace(workspace: Workspace) {
      this.selectedWorkspace = workspace;

      // Ensure that this workspace's expansion state exists in the store
      if (!this.spaceExpansionState[workspace.id]) {
        this.$patch({ spaceExpansionState: { [workspace.id]: [] } });
      }
    },
    setSpaceExpansionState(workspaceId: number, spaceExpansionState: number[]) {
      this.spaceExpansionState[workspaceId] = spaceExpansionState;
    },
  },
});
