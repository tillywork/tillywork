import type { Workspace } from '@/components/project-management/workspaces/types';
import { defineStore } from 'pinia';

export const useWorkspaceStore = defineStore('workspace', {
    persist: true,
    state: () => {
        return {
            selectedWorkspace: null as Workspace | null,
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
        setSpaceExpansionState(workspaceId: number, spaceExpansionState: boolean[]) {
            this.spaceExpansionState[workspaceId] = spaceExpansionState;
        },
    },
});
