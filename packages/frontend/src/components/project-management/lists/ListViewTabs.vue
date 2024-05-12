<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { ViewTypes, type View } from '../views/types';
import { ref } from 'vue';
import { watch } from 'vue';
import { onMounted } from 'vue';

const router = useRouter();
const route = useRoute();
const props = defineProps<{
  views: View[];
}>();
const selectedTab = defineModel<View>();
const isLoading = ref(false);

function handleTabSelection(tab: View) {
  selectedTab.value = tab;
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

watch(
  selectedTab,
  () => {
    if (selectedTab.value) {
      router.replace({
        name: 'ListView',
        params: {
          workspaceId: route.params.workspaceId,
          listId: route.params.listId,
          viewId: selectedTab.value?.id,
        },
      });
    }
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  if (props.views && props.views.length > 0 && !selectedTab.value) {
    selectedTab.value = props.views[0];
  } else {
    selectedTab.value = undefined;
  }
});
</script>

<template>
  <div class="position-relative">
    <div class="d-flex justify-start align-center">
      <template v-for="view in views" :key="view.id">
        <v-btn
          rounded="0"
          variant="text"
          class="text-capitalize"
          color="default"
          @click="handleTabSelection(view)"
          size="small"
          :class="
            selectedTab?.id === view.id ? 'border-b-md border-b-primary' : ''
          "
        >
          <template #prepend>
            <v-icon :icon="getViewIconByType(view.type)" />
          </template>
          {{ view.name }}
        </v-btn>
      </template>
      <v-btn
        class="text-capitalize"
        variant="text"
        size="small"
        rounded="0"
        @click="isLoading = !isLoading"
      >
        <template #prepend>
          <v-icon icon="mdi-plus" />
        </template>
        View
      </v-btn>
    </div>
    <v-progress-linear
      :active="isLoading"
      indeterminate
      :height="2"
      color="primary"
      absolute
      location="bottom"
    />
  </div>
</template>

<style lang="scss">
.border-b-primary {
  border-block-end-color: rgba(var(--v-theme-primary)) !important;
}
</style>
