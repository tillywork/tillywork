<script setup lang="ts">
import BaseListViewTabs from './BaseListViewTabs.vue';
import BaseView from '../views/BaseView.vue';
import type { List } from './types';
import type { View } from '../views/types';
import { useViewsService } from '@/composables/services/useViewsService';
import BaseEditorInput from '@/components/common/base/BaseEditor/BaseEditorInput.vue';
import { useListsService } from '@/composables/services/useListsService';
import { useSnackbarStore } from '@/stores/snackbar';

const props = defineProps<{
  list: List;
}>();
const listsService = useListsService();
const updateListMutation = listsService.useUpdateListMutation();

const snackbar = useSnackbarStore();

const listId = computed(() => props.list.id);

// Populates default value on mount.
const listName = ref(props.list.name);
// Populates a different default value whenever the user switches between lists.
watch(listId, () => {
  listName.value = props.list.name;
});
const debouncedName = useDebounce(listName, 2000);
watch(debouncedName, () => {
  updateName();
});

function updateName() {
  const newName = listName.value.trim();
  if (newName !== '' && newName !== props.list.name) {
    updateListMutation
      .mutateAsync({ id: props.list.id, updateDto: { name: newName } })
      .then(() => {
        snackbar.showSnackbar({
          message: 'List name updated.',
          color: 'success',
          timeout: 2000,
        });
      });
  }
}

const { useGetViewsQuery } = useViewsService();
const { data: views } = useGetViewsQuery({ listId });
const view = ref<View>();
</script>

<template>
  <div class="position-relative">
    <div class="pa-4 pb-0">
      <div class="px-9">
        <div class="d-flex align-center mb-3">
          <base-avatar
            :text="list.name"
            color="rgb(116, 140, 7)"
            size="x-small"
            rounded="md"
            class="mr-1"
          />
          <!-- TODO: Figure out why autofocus cannot be disabled. -->
          <base-editor-input
            v-model="listName"
            placeholder="List name"
            :heading="2"
            single-line
            class="flex-1-1-100 mt-1"
            editable
            disable-commands
            :autofocus="false"
          />
        </div>
        <base-list-view-tabs v-if="views" v-model="view" :list :views />
      </div>
    </div>
    <v-divider />
    <template v-if="view">
      <base-view :view :list />
    </template>
  </div>
</template>
