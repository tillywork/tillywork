<script setup lang="ts">
import { ref } from 'vue';
import NavigationWorkspaceSelector from './NavigationWorkspaceSelector.vue';
import CreateSpaceDialogAndButton from '../navigation/CreateSpaceDialogAndButton.vue';
import CreateListDialog from '../navigation/CreateListDialog.vue';
import CreateListDialogButton from '../navigation/CreateListDialogButton.vue';
import { SpacesService } from '../spaces/spaces.service';
import { watch } from 'vue';
import { useWorkspaceStore } from '@/stores/workspace';
import { storeToRefs } from 'pinia';
import { type Space } from '../spaces/types';
import type { List } from '../lists/types';
import { useRouter } from 'vue-router';

const router = useRouter();
const workspaceStore = useWorkspaceStore();
const { selectedWorkspace } = storeToRefs(workspaceStore);

const spaces = ref<Space[]>();
const spacesService = new SpacesService();
const createListDialog = ref(false);
const listMenu = ref(false);
const freezeListHoverId = ref<number | null>();

watch(selectedWorkspace, async (workspace) => {
  if (workspace) {
    getSpaces();

    // TODO: Navigate to workspace on change
  }
}, { immediate: true });

async function getSpaces() {
  spaces.value = await spacesService.getSpaces({
    workspaceId: selectedWorkspace.value!.id
  });
}

function handleCreateListDialogClick(space: Space) {
  workspaceStore.setSelectedSpace(space);
}

function handleListClick(list: List) {
  router.push({
    name: 'ListPage',
    params: {
      workspaceId: selectedWorkspace?.value?.id,
      spaceId: list.spaceId,
      listId: list.id,
    }
  });
}

function handleListMenuClick(list: List) {
  listMenu.value = !listMenu.value;
  freezeListHoverId.value = list.id;
}

watch(listMenu, (isOpen) => {
  if (!isOpen) {
    freezeListHoverId.value = null;
  }
});
</script>

<template>
  <div>
    <navigation-workspace-selector />
    <!-- Spaces -->
    <v-list nav density="compact" :lines="false">
      <template v-if="spaces && spaces.length > 0">
        <div class="d-flex mb-2 pe-2">
          <v-spacer />
          <create-space-dialog-and-button @create="getSpaces" />
        </div>
        <template v-for="space in spaces" :key="space.id">
          <v-hover v-slot="{ isHovering, props: hoverProps }">
            <v-list-group :value="space.name" v-bind="hoverProps" subgroup>
              <template v-slot:activator="{ props: groupProps }">
                <v-list-item rounded="md" v-bind="groupProps" slim>
                  <template v-slot:prepend v-if="!isHovering">
                    <v-icon>mdi-folder-outline</v-icon>
                  </template>
                  <v-list-item-title class="user-select-none">
                    {{ space.name }}
                  </v-list-item-title>
                  <template v-slot:append v-if="isHovering">
                    <create-list-dialog-button v-model="createListDialog" @click="handleCreateListDialogClick(space)" />
                  </template>
                </v-list-item>
              </template>

              <template v-for="list in space.lists" :key="list.id">
                <v-hover v-slot="{ isHovering: isListHovering, props: listHoverProps }">
                  <v-list-item rounded="md" prepend-icon="mdi-list-box-outline" slim v-bind="listHoverProps"
                    @click="handleListClick(list)">
                    <v-list-item-title user-select-none>{{ list.name }}</v-list-item-title>
                    <template v-slot:append v-if="isListHovering || freezeListHoverId === list.id">
                      <v-btn id="list-menu-btn" color="default" density="compact" icon="mdi-dots-vertical"
                        rounded="md" size="small" @click.stop @click="handleListMenuClick(list)" />

                      <v-menu v-model="listMenu" :close-on-content-click="false" target="#list-menu-btn">
                        <v-card class="pt-3 mt-2" width="300px" density="compact">
                          <div class="px-5 text-truncate mb-2">
                            <v-icon size="small">mdi-sitemap</v-icon>
                            <span class="ml-1">
                              Your workspaces
                            </span>
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
            <create-space-dialog-and-button @create="getSpaces" />
          </v-list-item-title>
        </v-list-item>
      </template>
    </v-list>

    <create-list-dialog v-model="createListDialog" @create="getSpaces" />
  </div>
</template>

<style lang="scss">
.v-list-group__items .v-list-item {
  padding-inline-start: 24px !important
}
</style>