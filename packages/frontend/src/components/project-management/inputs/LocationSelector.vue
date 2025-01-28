<script setup lang="ts">
import { useListsService } from '@/services/useListsService';
import { useSpacesService } from '@/services/useSpacesService';
import { useAuthStore } from '@/stores/auth';
import stringUtils from '@/utils/string';
import { VTextField } from 'vuetify/components';
import type { VNode } from 'vue';
import type { List, Space } from '@tillywork/shared';

export type LocationSelection = {
  location: Space | List;
  locationType: 'space' | 'list';
};

export type LocationMode = 'all' | 'spaces' | 'lists';

const { mode = 'all' } = defineProps<{
  mode?: LocationMode;
}>();
const selection = defineModel<LocationSelection>();

const attrs = useAttrs();
const slots = useSlots() as {
  activator?: (props: { props: any }) => VNode[];
};

const locationSearch = ref('');
const searchField = ref<VTextField>();
const locationMenu = ref(false);
const openedListGroups = ref<number[]>([]);

const enableSpaceSelection = computed(() => !['lists'].includes(mode));
const enableListSelection = computed(() => !['spaces'].includes(mode));

const filteredLocations = computed(() => {
  const filteredSpaces = spaces.value?.filter(
    (space) =>
      stringUtils.fuzzySearch(locationSearch.value, space.name) ||
      space.lists.some((list) =>
        stringUtils.fuzzySearch(locationSearch.value, list.name)
      )
  );

  const spacesWithFilteredLists = filteredSpaces?.map((space) => ({
    ...space,
    lists: space.lists.filter((list) =>
      stringUtils.fuzzySearch(locationSearch.value, list.name)
    ),
  }));

  const filteredLists = workspaceLists.value?.filter((list) =>
    stringUtils.fuzzySearch(locationSearch.value, list.name)
  );

  return {
    spaces: spacesWithFilteredLists,
    workspaceLists: filteredLists,
  };
});

const { workspace } = storeToRefs(useAuthStore());

const { useGetSpacesQuery } = useSpacesService();
const { data: spaces } = useGetSpacesQuery({
  workspaceId: workspace.value!.id,
  lists: true,
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

watch(
  spaces,
  (v) => {
    openedListGroups.value = v?.map((space) => space.id) ?? [];
  },
  { immediate: true }
);

watch(locationMenu, (v) => {
  if (v) {
    setTimeout(() => {
      searchField.value?.focus();
    }, 100);
  }
});
</script>

<template>
  <v-btn
    v-if="!slots.activator"
    id="location-selector-btn"
    v-bind="attrs"
    class="text-none text-caption justify-start px-4"
    color="default"
    variant="outlined"
    border="thin"
    density="compact"
    size="large"
  >
    <template #prepend>
      <v-icon
        :icon="selection?.location.icon ?? 'mdi-map-marker'"
        :color="selection?.location.iconColor"
      />
    </template>
    {{ selection?.location.name ?? 'Location' }}
  </v-btn>
  <v-menu
    v-model="locationMenu"
    :activator="!slots.activator ? '#location-selector-btn' : undefined"
    :close-on-content-click="false"
  >
    <template #activator="{ props }">
      <slot name="activator" v-bind="{ props }" />
    </template>
    <v-card>
      <v-text-field
        v-model="locationSearch"
        ref="searchField"
        hide-details
        autocomplete="off"
        clearable
        placeholder="Search.."
        variant="filled"
        rounded="0"
      />
      <v-list
        v-model:opened="openedListGroups"
        open-strategy="multiple"
        class="overflow-scroll"
        max-height="300"
      >
        <template v-if="spaces">
          <template v-for="space in filteredLocations.spaces" :key="space.id">
            <v-list-group :value="space.id">
              <template #activator="{ props, isOpen }">
                <v-list-item
                  v-bind="!enableSpaceSelection ? props : undefined"
                  @click="
                    enableSpaceSelection
                      ? handleSelection({
                          location: space,
                          locationType: 'space',
                        })
                      : undefined
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
                      v-if="enableListSelection"
                      v-bind="props"
                      @click.stop
                      :icon="isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                    />
                  </template>
                </v-list-item>
              </template>

              <template v-if="enableListSelection">
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
              </template>
            </v-list-group>
          </template>
        </template>

        <template v-if="enableListSelection">
          <template
            v-for="list in filteredLocations.workspaceLists"
            :key="list.id"
          >
            <v-list-item
              @click="handleSelection({ location: list, locationType: 'list' })"
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
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>
