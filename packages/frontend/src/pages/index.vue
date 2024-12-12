<script setup lang="ts">
import { useStateStore } from '@/stores/state';
import { useAuthStore } from '@/stores/auth';
import { useListsService } from '@/services/useListsService';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const { setCurrentList, navigateToLastList, getCurrentListBySelectedModule } =
  useStateStore();
const authStore = useAuthStore();
const { workspace } = storeToRefs(authStore);

const currentList = computed(() => getCurrentListBySelectedModule());
const workspaceId = computed(() => workspace.value?.id ?? 0);

const { useGetListsQuery } = useListsService();

const { data: lists } = useGetListsQuery({ workspaceId, throughSpace: true });

watch(
  lists,
  (v) => {
    if (v) {
      if (!currentList.value) {
        if (v[0]) {
          setCurrentList(v[0]);
          navigateToLastList();
        }
      } else {
        navigateToLastList();
      }
    }
  },
  { immediate: true }
);
</script>

<template>&nbsp;</template>
