<script setup lang="ts">
import CreateSpaceBtn from './CreateSpaceBtn.vue';
import { useSpacesService } from '../../../composables/services/useSpacesService';
import { useWorkspaceStore } from '@/stores/workspace';
import NavigationWorkspaceSpaceItem from './NavigationWorkspaceSpaceItem.vue';
import { useAuthStore } from '@/stores/auth';

const workspaceStore = useWorkspaceStore();
const { spaceExpansionState } = storeToRefs(workspaceStore);
const { workspace } = storeToRefs(useAuthStore());

const spacesService = useSpacesService();
const listMenu = ref(false);
const freezeListHoverId = ref<number | null>();

const enableSpacesFetch = ref(false);

const workspaceId = computed(() => workspace.value?.id ?? 0);

const spacesQuery = spacesService.useGetSpacesQuery({
  workspaceId,
  enabled: enableSpacesFetch,
});

const currentSpaceExpansionState = computed({
  get: () =>
    workspace.value ? spaceExpansionState.value[workspace.value.id] : [],
  set: (state) => {
    if (workspace.value) {
      workspaceStore.setSpaceExpansionState(workspace.value.id, state);
    }
  },
});

watch(
  workspace,
  async (workspace) => {
    if (workspace) {
      enableSpacesFetch.value = true;
      spacesQuery.refetch();
    }
  },
  { immediate: true }
);

watch(listMenu, (isOpen) => {
  if (!isOpen) {
    freezeListHoverId.value = null;
  }
});
</script>

<template>
  <div class="navigation-workspace">
    <!-- Spaces -->
    <v-list
      v-model:opened="currentSpaceExpansionState"
      open-strategy="multiple"
      v-if="workspace"
    >
      <template
        v-if="spacesQuery.data.value && spacesQuery.data.value.length > 0"
      >
        <div class="d-flex mb-2 pa-2">
          <span class="text-caption">Spaces</span>
          <v-spacer />
          <create-space-btn />
        </div>
        <template v-for="space in spacesQuery.data.value" :key="space.id">
          <navigation-workspace-space-item :space="space" />
        </template>
      </template>
      <template v-else>
        <v-list-item>
          <v-list-item-title class="d-flex align-center">
            <span>No spaces found</span>
            <v-spacer />
            <create-space-btn />
          </v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </div>
</template>

<style lang="scss">
.navigation-workspace {
  .v-list-group__items .v-list-item {
    padding-inline-start: 24px !important;
  }
}
</style>
