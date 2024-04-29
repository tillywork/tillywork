<script setup lang="ts">
import { computed, ref } from 'vue';
import NavigationWorkspaceSelector from './NavigationWorkspaceSelector.vue';
import CreateSpaceDialogAndButton from '../navigation/CreateSpaceDialogAndButton.vue';
import CreateListDialogAndButton from '../navigation/CreateListDialogAndButton.vue';
import { useSpacesService } from '../../../composables/services/useSpacesService';
import { watch } from 'vue';
import { useWorkspaceStore } from '@/stores/workspace';
import { storeToRefs } from 'pinia';
import { type Space } from '../spaces/types';
import type { List } from '../lists/types';
import { useRoute, useRouter } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';

const route = useRoute();
const router = useRouter();
const workspaceStore = useWorkspaceStore();
const { selectedWorkspace, selectedSpace, spaceExpansionState } =
  storeToRefs(workspaceStore);

const spacesService = useSpacesService();
const createListDialog = ref(false);
const listMenu = ref(false);
const freezeListHoverId = ref<number | null>();
const freezeSpaceHoverId = ref<number | null>();

const workspaceId = computed(() => selectedWorkspace.value?.id);
const spacesQuery = useQuery({
  queryKey: [
    'spaces',
    {
      workspaceId,
    },
  ],
  queryFn: () =>
    spacesService.getSpaces({
      workspaceId: selectedWorkspace.value!.id,
    }),
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

function handleCreateListDialogClick(space: Space) {
  selectedSpace.value = space;
  freezeSpaceHoverId.value = space.id;
}

function handleListClick(list: List) {
  router.push({
    name: 'ListPage',
    params: {
      workspaceId: selectedWorkspace?.value?.id,
      spaceId: list.spaceId,
      listId: list.id,
    },
  });
}

function handleListMenuClick(list: List) {
  listMenu.value = !listMenu.value;
  freezeListHoverId.value = list.id;
}

watch(
  selectedWorkspace,
  async (workspace) => {
    if (workspace) {
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
    <navigation-workspace-selector />
    <!-- Spaces -->
    <v-list
      v-model:opened="currentSpaceExpansionState"
      nav
      density="compact"
      :lines="false"
      open-strategy="multiple"
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
          <v-hover v-slot="{ isHovering, props: hoverProps }">
            <v-list-group :value="space.id" v-bind="hoverProps" subgroup>
              <template v-slot:activator="{ props: groupProps }">
                <v-list-item rounded="md" v-bind="groupProps" slim>
                  <template v-slot:prepend v-if="!isHovering">
                    <v-icon>mdi-folder-outline</v-icon>
                  </template>
                  <v-list-item-title class="user-select-none">
                    {{ space.name }}
                  </v-list-item-title>
                  <template
                    v-slot:append
                    v-if="isHovering || freezeSpaceHoverId === space.id"
                  >
                    <create-list-dialog-and-button
                      v-model="createListDialog"
                      @click="handleCreateListDialogClick(space)"
                    />
                  </template>
                </v-list-item>
              </template>

              <template v-for="list in space.lists" :key="list.id">
                <v-hover
                  v-slot="{ isHovering: isListHovering, props: listHoverProps }"
                >
                  <v-list-item
                    rounded="md"
                    prepend-icon="mdi-list-box-outline"
                    slim
                    v-bind="listHoverProps"
                    @click="handleListClick(list)"
                    :active="+route.params.listId === list.id"
                  >
                    <v-list-item-title class="user-select-none">{{
                      list.name
                    }}</v-list-item-title>
                    <template
                      v-slot:append
                      v-if="isListHovering || freezeListHoverId === list.id"
                    >
                      <v-btn
                        id="list-menu-btn"
                        color="default"
                        density="compact"
                        icon="mdi-dots-vertical"
                        rounded="md"
                        size="small"
                        @click.stop
                        @click="handleListMenuClick(list)"
                      />

                      <v-menu
                        v-model="listMenu"
                        :close-on-content-click="false"
                        target="#list-menu-btn"
                      >
                        <v-card
                          class="pt-3 mt-2"
                          width="300px"
                          density="compact"
                        >
                          <div class="px-5 text-truncate mb-2">
                            <v-icon size="small">mdi-sitemap</v-icon>
                            <span class="ml-1"> Your workspaces </span>
                          </div>
                        </v-card>
                      </v-menu>
                    </template>
                  </v-list-item>
                </v-hover>
              </template>
            </v-list-group>
          </v-hover>
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
