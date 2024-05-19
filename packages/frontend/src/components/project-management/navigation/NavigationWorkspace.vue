<script setup lang="ts">
import { computed, ref } from 'vue';
import CreateSpaceDialogAndButton from '../navigation/CreateSpaceDialogAndButton.vue';
import { useSpacesService } from '../../../composables/services/useSpacesService';
import { watch } from 'vue';
import { useWorkspaceStore } from '@/stores/workspace';
import { storeToRefs } from 'pinia';
import NavigationWorkspaceSpaceItem from './NavigationWorkspaceSpaceItem.vue';

const workspaceStore = useWorkspaceStore();
const { selectedWorkspace, spaceExpansionState } = storeToRefs(workspaceStore);

const spacesService = useSpacesService();
const createListDialog = ref(false);
const listMenu = ref(false);
const freezeListHoverId = ref<number | null>();
const freezeSpaceHoverId = ref<number | null>();

const enableSpacesFetch = ref(false);

const workspaceId = computed(() => selectedWorkspace.value?.id);

const spacesQuery = spacesService.useGetSpacesQuery({
  workspaceId: workspaceId,
  enabled: enableSpacesFetch,
});

const currentSpaceExpansionState = computed({
  get: () =>
    selectedWorkspace.value
      ? spaceExpansionState.value[selectedWorkspace.value.id]
      : [],
  set: (state) => {
    if (selectedWorkspace.value) {
      workspaceStore.setSpaceExpansionState(selectedWorkspace.value.id, state);
    }
  },
});

watch(
  selectedWorkspace,
  async (workspace) => {
    if (workspace) {
      enableSpacesFetch.value = true;
      spacesQuery.refetch();

      // TODO: Navigate to workspace on change
    }
  },
  { immediate: true }
);

watch(listMenu, (isOpen) => {
  if (!isOpen) {
    freezeListHoverId.value = null;
  }
});

watch(createListDialog, (isOpen) => {
  if (!isOpen) {
    freezeSpaceHoverId.value = null;
  }
});
</script>

<template>
  <div class="navigation-workspace">
    <!-- Spaces -->
    <v-list
      v-model:opened="currentSpaceExpansionState"
      open-strategy="multiple"
      v-if="selectedWorkspace"
    >
      <template
        v-if="spacesQuery.data.value && spacesQuery.data.value.length > 0"
      >
        <div class="d-flex mb-2 pa-2">
          <span class="text-caption">Spaces</span>
          <v-spacer />
          <create-space-dialog-and-button />
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
            <create-space-dialog-and-button />
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
