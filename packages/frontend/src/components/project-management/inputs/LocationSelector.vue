<script setup lang="ts">
import { useListsService } from '@/composables/services/useListsService';
import { useSpacesService } from '@/composables/services/useSpacesService';
import { useAuthStore } from '@/stores/auth';
import type { Space } from '../spaces/types';
import type { List } from '../lists/types';

export type LocationSelection = {
  location: Space | List;
  locationType: 'space' | 'list';
};

const selection = defineModel<LocationSelection>();

const attrs = useAttrs();

const { workspace } = storeToRefs(useAuthStore());

const { useGetSpacesQuery } = useSpacesService();
const { data: spaces } = useGetSpacesQuery({
  workspaceId: workspace.value!.id,
});

const { useGetListsQuery } = useListsService();
const { data: workspaceLists } = useGetListsQuery({
  workspaceId: workspace.value!.id,
});

function handleSelection(location: LocationSelection) {
  selection.value = location;
}

function isLocationActive(location: LocationSelection) {
  return (
    location.locationType === selection.value?.locationType &&
    location.location.id === selection.value?.location.id
  );
}
</script>

<template>
  <v-btn
    id="location-selector-btn"
    v-bind="attrs"
    class="text-none text-caption"
    color="default"
    variant="outlined"
    border="thin"
    :prepend-icon="selection?.location.icon"
    >{{ selection?.location.name ?? 'Location' }}</v-btn
  >
  <v-menu activator="#location-selector-btn" :close-on-content-click="false">
    <v-card>
      <v-list nav :lines="false" slim open-strategy="multiple">
        <template v-if="spaces">
          <template v-for="space in spaces" :key="space.id">
            <v-list-group :value="true">
              <template #activator="{ props, isOpen }">
                <v-list-item
                  @click="
                    handleSelection({ location: space, locationType: 'space' })
                  "
                  :active="
                    isLocationActive({ location: space, locationType: 'space' })
                  "
                >
                  <template #prepend>
                    <v-icon :icon="space.icon" :color="space.iconColor" />
                  </template>
                  <v-list-item-title>
                    {{ space.name }}
                  </v-list-item-title>
                  <template #append>
                    <base-icon-btn
                      v-bind="props"
                      @click.stop
                      density="compact"
                      :icon="isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                    />
                  </template>
                </v-list-item>
              </template>

              <template v-for="list in space.lists" :key="list.id">
                <v-list-item
                  @click="
                    handleSelection({ location: list, locationType: 'list' })
                  "
                  :active="
                    isLocationActive({ location: list, locationType: 'list' })
                  "
                >
                  <template #prepend>
                    <v-icon :icon="list.icon" :color="list.iconColor" />
                  </template>
                  <v-list-item-title>
                    {{ list.name }}
                  </v-list-item-title>
                </v-list-item>
              </template>
            </v-list-group>
          </template>
        </template>

        <template v-for="list in workspaceLists" :key="list.id">
          <v-list-item
            @click="handleSelection({ location: list, locationType: 'list' })"
            :active="isLocationActive({ location: list, locationType: 'list' })"
          >
            <template #prepend>
              <v-icon :icon="list.icon" :color="list.iconColor" />
            </template>
            <v-list-item-title>
              {{ list.name }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>
