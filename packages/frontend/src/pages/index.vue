<script setup lang="ts">
import { useStateStore } from '@/stores/state';
import { useWorkspaceStore } from '@/stores/workspace';
import { useAuthStore } from '@/stores/auth';
import { useSpacesService } from '@/composables/services/useSpacesService';
import { useListsService } from '@/composables/services/useListsService';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const router = useRouter();

const { currentList } = useStateStore();
const workspaceStore = useWorkspaceStore();
const authStore = useAuthStore();
const { workspace } = storeToRefs(authStore);

const isWorkspaceReady = computed(() => !!workspace.value);

const { useGetSpacesQuery } = useSpacesService();
const { data: spaces } = useGetSpacesQuery({
  workspaceId: workspace.value?.id,
  enabled: isWorkspaceReady,
});
const { useGetListsQuery } = useListsService();
const { data: lists } = useGetListsQuery({
  workspaceId: workspace.value?.id,
  enabled: isWorkspaceReady,
});

watch(lists, (v) => {
  if (v) {
    workspaceStore.setSpaceExpansionState(
      workspace.value!.id,
      [spaces.value?.[0]?.id].filter(Boolean) as number[]
    );
    router.push({ path: `/pm/list/${v[0].id}` });
  }
});

onMounted(() => {
  if (currentList) {
    router.push({ path: `/pm/list/${currentList.id}` });
  }
});
</script>

<template>&nbsp;</template>
