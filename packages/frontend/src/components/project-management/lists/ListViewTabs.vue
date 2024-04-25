<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { type View } from '../views/types';
import { ref } from 'vue';
import { watch } from 'vue';
const router = useRouter();
const route = useRoute();
const views = defineModel<View[]>('views', {
  required: true,
});
const selectedTab = defineModel<View>();
const isLoading = ref(false);

function handleTabSelection(tab: View) {
  selectedTab.value = tab;
}

watch(
  views,
  () => {
    if (views.value && !selectedTab.value) {
      selectedTab.value = views.value[0];
    } else {
      selectedTab.value = undefined;
    }
  },
  { immediate: true, deep: true }
);

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
  { immediate: true }
);
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
          >{{ view.name }}</v-btn
        >
      </template>
      <v-btn
        variant="text"
        size="small"
        rounded="0"
        @click="isLoading = !isLoading"
      >
        <v-icon icon="mdi-plus" />
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
