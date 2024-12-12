import { WorkspaceTypes, type List } from '@tillywork/shared';

export type ListState = {
  lastViewId?: number;
};

export const useStateStore = defineStore('state', {
  persist: true,
  state: () => {
    return {
      selectedModule: WorkspaceTypes.PROJECT_MANAGEMENT as WorkspaceTypes,
      /** Used to disable command pallete when user is typing. */
      isInputFocused: false,
      /** Is information navigation drawer open. */
      isInfoDrawerOpen: true,
      /** Used in BaseCard.vue to hide or display children cards. */
      areChildCardsExpanded: false,
      //TODO make this per module
      /** Sets the latest active list. Used to redirect the user when the app is reopened. */
      currentList: undefined as undefined | List,
      /** Used to save which spaces are expanded in the workspace. */
      spaceExpansionState: {} as Record<number, number[]>,
      /** Saves the last view the user was on in a list. */
      listState: {} as Record<number, ListState>,
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
    toggleChildCards() {
      this.areChildCardsExpanded = !this.areChildCardsExpanded;
    },
    setCurrentList(list: undefined | List) {
      this.currentList = list;
    },
    setTitle(title?: string) {
      document.title = `${title ? title + ' | tillywork' : 'tillywork'}`;
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
