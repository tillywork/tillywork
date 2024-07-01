export type ListState = {
  lastViewId?: number;
};

export const useWorkspaceStore = defineStore('workspace', {
  persist: true,
  state: () => {
    return {
      //TODO move to state store
      spaceExpansionState: {} as Record<number, number[]>,
      listState: {} as Record<number, ListState>,
    };
  },
  actions: {
    setSpaceExpansionState(workspaceId: number, spaceExpansionState: number[]) {
      this.spaceExpansionState[workspaceId] = spaceExpansionState;
    },
    setListLastView({ listId, viewId }: { listId: number; viewId: number }) {
      if (!this.listState[listId]) this.listState[listId] = {};
      this.listState[listId].lastViewId = viewId;
    },
  },
});
