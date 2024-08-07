<script setup lang="ts">
import { useStateStore } from '@/stores/state';
import { useWorkspaceStore } from '@/stores/workspace';
import { useAuthStore } from '@/stores/auth';
import { useSpacesService } from '@/services/useSpacesService';
import { useListsService } from '@/services/useListsService';

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

const isWorkspaceReady = computed(() => !!workspace.value && !currentList);
const workspaceId = computed(() => workspace.value?.id ?? 0);

const { useGetSpacesQuery } = useSpacesService();
const { data: spaces } = useGetSpacesQuery({
  workspaceId,
  enabled: isWorkspaceReady,
});
const { useGetListsQuery } = useListsService();
const { data: lists } = useGetListsQuery({
  workspaceId,
  throughSpace: true,
  enabled: isWorkspaceReady,
});

watch(lists, (v) => {
  if (v && !currentList) {
    workspaceStore.setSpaceExpansionState(
      workspace.value!.id,
      [spaces.value?.[0]?.id].filter(Boolean) as number[]
    );
    router.push({ path: `/pm/list/${v[0].id}` });
  }
});

onMounted(() => {
  if (currentList) {
    router.push('/pm/list/' + currentList.id);
  }
});
</script>

<template>&nbsp;</template>
