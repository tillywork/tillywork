import type { Workspace } from '@/components/project-management/workspaces/types';

export type ListState = {
  lastViewId?: number;
};

export const useWorkspaceStore = defineStore('workspace', {
  persist: true,
  state: () => {
    return {
      selectedWorkspace: null as Workspace | null,
      spaceExpansionState: {} as Record<number, number[]>,
      listState: {} as Record<number, ListState>,
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
    clearSelectedWorkspace() {
      this.selectedWorkspace = null;
    },
    setSpaceExpansionState(workspaceId: number, spaceExpansionState: number[]) {
      this.spaceExpansionState[workspaceId] = spaceExpansionState;
    },
    setListLastView({ listId, viewId }: { listId: number; viewId: number }) {
      if (!this.listState[listId]) this.listState[listId] = {};
      this.listState[listId].lastViewId = viewId;
    },
  },
});
