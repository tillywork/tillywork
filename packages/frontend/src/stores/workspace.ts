import type { Space } from '@/modules/project-management/spaces/types';
import type { Workspace } from '@/modules/project-management/workspaces/types';
import { defineStore } from 'pinia';

export const useWorkspaceStore = defineStore('workspace', {
    persist: true,
    state: () => {
        return {
            selectedWorkspace: null as Workspace | null,
            selectedSpace: null as Space | null,
            spaceExpansionState: {} as Record<number, boolean[]>,
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
        setSelectedSpace(space: Space) {
            this.selectedSpace = space;
        },
        setSpaceExpansionState(workspaceId: number, spaceExpansionState: boolean[]) {
            this.spaceExpansionState[workspaceId] = spaceExpansionState;
        },
    },
});
