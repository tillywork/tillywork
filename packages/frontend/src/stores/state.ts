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
      /** Sets the latest active list for each module. Used to redirect the user when the app is reopened. */
      currentList: {} as Record<WorkspaceTypes, undefined | List>,
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
      this.currentList[this.selectedModule] = list;
    },
    clearCurrentList() {
      this.currentList = {
        [WorkspaceTypes.PROJECT_MANAGEMENT]: undefined,
        [WorkspaceTypes.CRM]: undefined,
        [WorkspaceTypes.AGILE_PROJECTS]: undefined,
      };
    },
    getCurrentListBySelectedModule() {
      return this.currentList[this.selectedModule];
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
    navigateToLastList() {
      let link = '/';
      const currentModuleList = this.currentList[this.selectedModule] as List;

      switch (this.selectedModule) {
        case WorkspaceTypes.CRM:
          link = this.getCrmListLink(currentModuleList);
          break;

        case WorkspaceTypes.PROJECT_MANAGEMENT:
        default:
          link = `/pm/list/${currentModuleList.id}`;
          break;
      }

      this.$router.push(link);
    },
    getCrmListLink(list: List) {
      return `/crm/${list?.slug ?? 'contacts'}`;
    },
  },
});
