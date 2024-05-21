<script setup lang="ts">
import { ViewTypes, type View } from '../views/types';

const router = useRouter();
const props = defineProps<{
  views: View[];
}>();
const selectedTab = defineModel<number>();
const freezeHoverViewId = ref<number>();

function handleTabSelection(tab: View) {
  selectedTab.value = tab.id;
  router.replace(`/pm/list/${tab.listId}/view/${tab.id}`);
}

function getViewIconByType(type: ViewTypes) {
  switch (type) {
    case ViewTypes.TABLE:
      return 'mdi-table';
    case ViewTypes.BOARD:
      return 'mdi-view-column';
    default:
      return 'mdi-view-carousel';
  }
}

onMounted(() => {
  if (props.views && props.views.length && !selectedTab.value) {
    handleTabSelection(props.views[0]);
  }
});
</script>

<template>
  <div class="d-flex justify-start align-center">
    <template v-for="view in views" :key="view.id">
      <v-hover #="{ isHovering, props }">
        <v-btn
          v-bind="props"
          rounded="0"
          variant="text"
          class="text-capitalize"
          color="default"
          @click="handleTabSelection(view)"
          size="small"
          :class="selectedTab === view.id ? 'border-b-md border-b-primary' : ''"
        >
          <template #prepend>
            <v-icon :icon="getViewIconByType(view.type)" />
          </template>
          {{ view.name }}
          <template
            #append
            v-if="(false && isHovering) || freezeHoverViewId === view.id"
          >
            <v-menu
              @update:model-value="
                (v) => {
                  if (!v) freezeHoverViewId = undefined;
                }
              "
              offset="3"
              width="200"
            >
              <template #activator="{ props }">
                <base-icon-btn
                  v-bind="props"
                  icon="mdi-dots-vertical"
                  density="compact"
                  class="ms-2"
                  @click="freezeHoverViewId = view.id"
                />
              </template>
              <v-card color="accent" class="border-thin">
                <v-list class="bg-transparent">
                  <v-list-item class="text-error text-caption">
                    <template #prepend>
                      <v-icon icon="mdi-delete" />
                    </template>
                    Delete
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </template>
        </v-btn>
      </v-hover>
    </template>
    <v-btn
      class="text-capitalize"
      variant="text"
      size="small"
      rounded="0"
      v-tooltip:end="'Coming Soon'"
    >
      <template #prepend>
        <v-icon icon="mdi-plus" />
      </template>
      View
    </v-btn>
  </div>
</template>

<style lang="scss">
.border-b-primary {
  border-block-end-color: rgba(var(--v-theme-primary)) !important;
}
</style>
