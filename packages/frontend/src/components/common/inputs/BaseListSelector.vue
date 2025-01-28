<script setup lang="ts">
import { useListsService } from '@/services/useListsService';
import { useAuthStore } from '@/stores/auth';
import { WorkspaceTypes, type List } from '@tillywork/shared';

const selectedList = defineModel<List>();

const { readonly = false } = defineProps<{
  readonly?: boolean;
}>();

const menu = ref(false);

const { workspace } = storeToRefs(useAuthStore());

const { useGetListsQuery } = useListsService();
const { data: lists } = useGetListsQuery({
  workspaceId: workspace.value!.id,
  throughSpace:
    workspace.value?.type === WorkspaceTypes.PROJECT_MANAGEMENT ? true : false,
});

watch(lists, (v) => {
  if (v && !selectedList.value) {
    selectedList.value = v[0];
  }
});

function selectList(list: List) {
  selectedList.value = list;
  menu.value = false;
}

function isListSelected(list: List) {
  return selectedList.value?.id === list.id;
}
</script>

<template>
  <v-menu v-model="menu" :close-on-content-click="false">
    <template #activator="{ props }">
      <v-chip
        v-bind="!readonly ? props : undefined"
        label
        :text="selectedList?.name ?? 'List'"
        density="compact"
        class="text-caption"
      />
    </template>
    <v-card>
      <v-list>
        <template v-for="list in lists" :key="list.id">
          <v-list-item @click="selectList(list)" :active="isListSelected(list)">
            <v-list-item-title>{{ list.name }}</v-list-item-title>
            <template #append v-if="isListSelected(list)">
              <v-icon icon="mdi-check" size="12" />
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>
