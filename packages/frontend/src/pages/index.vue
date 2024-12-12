<script setup lang="ts">
import { useStateStore } from '@/stores/state';
import { useAuthStore } from '@/stores/auth';
import { useSpacesService } from '@/services/useSpacesService';
import { useListsService } from '@/services/useListsService';
import { WorkspaceTypes, type List } from '@tillywork/shared';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const router = useRouter();

const { setCurrentList, setSpaceExpansionState } = useStateStore();
const { currentList, selectedModule } = storeToRefs(useStateStore());
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

function getCrmListLink(list: List) {
  return `/crm/${list.slug}`;
}

function navigateToLastList() {
  let link = '/';
  if (currentList.value && selectedModule.value) {
    switch (selectedModule.value) {
      case WorkspaceTypes.CRM:
        link = getCrmListLink(currentList.value);
        break;

      case WorkspaceTypes.PROJECT_MANAGEMENT:
      default:
        link = `/pm/list/${currentList.value.id}`;
        break;
    }
  }

  router.push(link);
}

watch(lists, (v) => {
  if (v && !currentList.value) {
    setSpaceExpansionState(
      workspace.value!.id,
      [spaces.value?.[0]?.id].filter(Boolean) as number[]
    );

    if (v[0]) {
      setCurrentList(v[0]);
    }

    navigateToLastList();
  }
});

onMounted(() => {
  if (currentList.value) {
    navigateToLastList();
  }
});
</script>

<template>&nbsp;</template>
