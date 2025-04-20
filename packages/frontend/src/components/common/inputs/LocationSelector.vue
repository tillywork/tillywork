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
  locationId: number;
  locationType: 'space' | 'list';
};

export type LocationMode = 'all' | 'spaces' | 'lists';

const {
  mode = 'all',
  multiple = false,
  clearable = false,
} = defineProps<{
  mode?: LocationMode;
  multiple?: boolean;
  clearable?: boolean;
}>();

const selection = defineModel<LocationSelection | LocationSelection[] | null>({
  default: null,
});

const attrs = useAttrs();
const slots = useSlots() as {
  activator?: (props: { props: any }) => VNode[];
};

const locationSearch = ref('');
const locationMenu = ref(false);
const openedListGroups = ref<number[]>([]);

const enableSpaceSelection = computed(() => mode !== 'lists');
const enableListSelection = computed(() => mode !== 'spaces');

const selectedLocations = computed<LocationSelection[]>(() => {
  if (!selection.value) return [];
  return Array.isArray(selection.value) ? selection.value : [selection.value];
});

/**
 * Return the list selections for a space.
 * @param space
 */
function getSpaceLists(space: Space): LocationSelection[] {
  return space.lists.map((list) => ({
    location: list,
    locationId: list.id,
    locationType: 'list' as const,
  }));
}

function isLocationActive(location: LocationSelection): boolean {
  if (!selection.value) return false;
  const selections = Array.isArray(selection.value)
    ? selection.value
    : [selection.value];

  // For lists, check if the parent space is selected.
  if (location.locationType === 'list') {
    const parentSpace = spaces.value?.find((space) =>
      space.lists.some((list) => list.id === location.location.id)
    );
    if (
      parentSpace &&
      selections.some(
        (item) =>
          item.locationType === 'space' && item.location.id === parentSpace.id
      )
    ) {
      return true;
    }
  }
  return selections.some(
    (item) =>
      item.locationType === location.locationType &&
      item.location.id === location.location.id
  );
}

/**
 * A space is “fully selected” if either its space selection is active
 * or all its lists are active.
 * @param space
 */
function isSpaceFullySelected(space: Space): boolean {
  if (
    selectedLocations.value.some(
      (item) => item.locationType === 'space' && item.location.id === space.id
    )
  ) {
    return true;
  }

  return false;
}

/**
 * “Partially selected” if some (but not all) lists are active.
 * @param space
 */
function isSpacePartiallySelected(space: Space): boolean {
  if (!multiple) return false;
  const lists = getSpaceLists(space);
  const activeCount = lists.filter((list) => isLocationActive(list)).length;
  return activeCount > 0 && activeCount <= lists.length;
}

/**
 * Return the proper icon for the space selection.
 * @param space
 */
function getSpaceSelectionIcon(space: Space): string {
  if (isSpaceFullySelected(space)) return 'mdi-checkbox-marked';
  if (isSpacePartiallySelected(space)) return 'mdi-minus-box';
  return 'mdi-checkbox-blank-outline';
}

const chipDisplay = computed(() => {
  const selections = selectedLocations.value;
  if (selections.length === 0) {
    return { icon: 'mdi-map-marker', label: 'Location' };
  }

  // Group selections by parent space.
  const groups: Record<
    string,
    { items: LocationSelection[]; parentName?: string }
  > = {};

  selections.forEach((sel) => {
    if (sel.locationType === 'space') {
      groups[sel.location.id] = {
        items: [sel],
        parentName: sel.location.name,
      };
    } else {
      const parentSpace = spaces.value?.find((space) =>
        space.lists.some((list) => list.id === sel.location.id)
      );
      const key = parentSpace ? parentSpace.id : sel.location.id;
      if (!groups[key]) {
        groups[key] = {
          items: [sel],
          parentName: parentSpace ? parentSpace.name : undefined,
        };
      } else {
        groups[key].items.push(sel);
      }
    }
  });

  const groupKeys = Object.keys(groups);
  if (groupKeys.length === 1) {
    const group = groups[groupKeys[0]];
    if (group.items[0].locationType === 'space') {
      return {
        icon: group.items[0].location.icon ?? 'mdi-map-marker',
        label: group.items[0].location.name,
      };
    } else if (group.items.length === 1) {
      return {
        icon: group.items[0].location.icon ?? 'mdi-map-marker',
        label: group.items[0].location.name,
      };
    } else {
      return {
        icon: 'mdi-format-list-bulleted',
        label: `${group.items.length} lists in ${group.parentName || 'space'}`,
      };
    }
  } else {
    return {
      icon: 'mdi-map-marker-multiple',
      label: `${groupKeys.length} locations`,
    };
  }
});

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

/**
 * When a space is clicked, toggle its selection.
 * If added, remove any individual list selections from that space.
 * @param space
 */
function handleSpaceSelection(space: Space) {
  if (!multiple) {
    selection.value = {
      location: space,
      locationType: 'space',
      locationId: space.id,
    };
    return;
  }

  const currentSelections = selectedLocations.value;
  const isSelected = currentSelections.some(
    (item) => item.locationType === 'space' && item.location.id === space.id
  );

  if (isSelected) {
    // Deselect the space.
    selection.value = currentSelections.filter(
      (item) =>
        !(item.locationType === 'space' && item.location.id === space.id)
    );
  } else {
    // Remove any individual list selections for this space and add the space selection.
    const otherSelections = currentSelections.filter((item) => {
      if (item.locationType === 'list') {
        const parent = spaces.value?.find((s) =>
          s.lists.some((list) => list.id === item.location.id)
        );
        if (parent && parent.id === space.id) return false;
      }
      return true;
    });
    selection.value = [
      ...otherSelections,
      { location: space, locationType: 'space', locationId: space.id },
    ];
  }
}

/**
 * When a list is clicked, if its parent space is selected then remove the space
 * and add individual selections for all lists except the toggled one.
 * Otherwise, simply toggle the list selection.
 * @param newLocation
 */
function handleSelection(newLocation: LocationSelection) {
  if (newLocation.locationType === 'space') {
    handleSpaceSelection(newLocation.location as Space);
    return;
  }

  if (!multiple) {
    selection.value = newLocation;
    return;
  }

  const parentSpace = spaces.value?.find((space) =>
    space.lists.some((list) => list.id === newLocation.location.id)
  );
  const currentSelections = selectedLocations.value;
  const isParentSpaceSelected = parentSpace
    ? currentSelections.some(
        (item) =>
          item.locationType === 'space' && item.location.id === parentSpace.id
      )
    : false;

  if (isParentSpaceSelected && parentSpace) {
    // The space was previously selected—deselect the space and add every
    // individual list *except* the one that was toggled.
    const otherSelections = currentSelections.filter((item) => {
      if (item.locationType === 'space' && item.location.id === parentSpace.id)
        return false;
      if (item.locationType === 'list') {
        const listParent = spaces.value?.find((space) =>
          space.lists.some((list) => list.id === item.location.id)
        );
        if (listParent && listParent.id === parentSpace.id) return false;
      }
      return true;
    });
    const newListSelections = parentSpace.lists
      .filter((list) => list.id !== newLocation.location.id)
      .map(
        (list) =>
          ({
            location: list,
            locationType: 'list',
            locationId: list.id,
          } as LocationSelection)
      );
    selection.value = [...otherSelections, ...newListSelections];
  } else {
    // Simply toggle the individual list.
    const existingIndex = currentSelections.findIndex(
      (item) =>
        item.locationType === 'list' &&
        item.location.id === newLocation.location.id
    );
    if (existingIndex === -1) {
      selection.value = [...currentSelections, newLocation];
    } else {
      selection.value = currentSelections.filter(
        (_, index) => index !== existingIndex
      );
    }
  }
}

function clearSelection() {
  selection.value = multiple ? [] : null;
}

// Open all list groups when spaces data is loaded.
watch(
  spaces,
  (v) => {
    openedListGroups.value = v?.map((space) => space.id) ?? [];
  },
  { immediate: true }
);
</script>

<template>
  <v-menu v-model="locationMenu" :close-on-content-click="false" width="200">
    <template #activator="{ props }">
      <template v-if="!slots.activator">
        <v-chip v-bind="{ ...attrs, ...props }" color="primary" variant="tonal">
          <template #prepend>
            <v-icon :icon="chipDisplay.icon" start />
          </template>
          <span class="text-caption">
            {{ chipDisplay.label }}
          </span>
        </v-chip>
      </template>
      <slot name="activator" v-bind="{ props }" />
    </template>
    <v-card width="200">
      <v-text-field
        v-model="locationSearch"
        hide-details
        autocomplete="off"
        placeholder="Search.."
        variant="plain"
        class="pt-0 px-4 pb-2 border-b-thin text-caption"
        rounded="0"
        autofocus
      />
      <v-list
        v-model:opened="openedListGroups"
        open-strategy="multiple"
        class="overflow-scroll"
        max-height="300"
        nav
      >
        <v-list-item
          v-if="clearable"
          @click="clearSelection"
          height="30"
          min-height="30"
          :active="
            !selection || (Array.isArray(selection) && selection.length === 0)
          "
        >
          <template #prepend>
            <v-icon icon="mdi-set-all" />
          </template>
          <v-list-item-title>All</v-list-item-title>
        </v-list-item>
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
                          locationId: space.id,
                        })
                      : undefined
                  "
                  :active="isSpaceFullySelected(space)"
                  height="30"
                  min-height="30"
                >
                  <template #prepend>
                    <div class="d-flex align-center ga-2 me-2">
                      <v-icon
                        v-if="multiple"
                        :icon="getSpaceSelectionIcon(space)"
                        :color="
                          isSpaceFullySelected(space) ? 'primary' : undefined
                        "
                      />
                      <v-icon :icon="space.icon" :color="space.iconColor" />
                    </div>
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
                      size="20"
                    />
                  </template>
                </v-list-item>
              </template>

              <template v-if="enableListSelection">
                <template v-for="list in space.lists" :key="list.id">
                  <v-list-item
                    @click="
                      handleSelection({
                        location: list,
                        locationType: 'list',
                        locationId: list.id,
                      })
                    "
                    :active="
                      isLocationActive({
                        location: list,
                        locationType: 'list',
                        locationId: list.id,
                      })
                    "
                    height="30"
                    min-height="30"
                  >
                    <template #prepend>
                      <div class="d-flex align-center ga-2 me-2">
                        <v-icon
                          v-if="multiple"
                          :icon="
                            isLocationActive({
                              location: list,
                              locationType: 'list',
                              locationId: list.id,
                            })
                              ? 'mdi-checkbox-marked'
                              : 'mdi-checkbox-blank-outline'
                          "
                        />
                        <v-icon :icon="list.icon" :color="list.iconColor" />
                      </div>
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
              @click="
                handleSelection({
                  location: list,
                  locationType: 'list',
                  locationId: list.id,
                })
              "
              :active="
                isLocationActive({
                  location: list,
                  locationType: 'list',
                  locationId: list.id,
                })
              "
              height="30"
              min-height="30"
            >
              <template #prepend>
                <div class="d-flex align-center ga-2 me-2">
                  <v-icon
                    v-if="multiple"
                    :icon="
                      isLocationActive({
                        location: list,
                        locationType: 'list',
                        locationId: list.id,
                      })
                        ? 'mdi-checkbox-marked'
                        : 'mdi-checkbox-blank-outline'
                    "
                  />
                  <v-icon :icon="list.icon" :color="list.iconColor" />
                </div>
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
