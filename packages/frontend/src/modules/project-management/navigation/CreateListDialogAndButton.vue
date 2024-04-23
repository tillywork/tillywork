<script setup lang="ts">
import { ref } from 'vue';
import { useWorkspaceStore } from '@/stores/workspace';
import { storeToRefs } from 'pinia';
import { validation } from '@/utils/validation';
import { VForm } from 'vuetify/lib/components/index.mjs';
import { useListsService } from '@/composables/services/useListsService';

const workspaceStore = useWorkspaceStore();
const { selectedSpace } = storeToRefs(workspaceStore);

const listsService = useListsService();
const createListDialog = defineModel<boolean>();
const createListForm = ref<null | VForm>(null);
const createListLoading = ref(false);
const createListData = ref({
  name: '',
  spaceId: selectedSpace.value?.id,
});

const emit = defineEmits(['create', 'click']);

function closeCreateListDialog() {
  createListDialog.value = false;
}

async function createList() {
  if (!createListForm.value?.isValid) return;

  createListLoading.value = true;
  createListData.value.spaceId = selectedSpace.value?.id;
  const list = await listsService.createList(createListData.value);

  emit('create', list);
  createListLoading.value = false;
  createListForm.value.reset();
  closeCreateListDialog();
}

function handleCreateListDialogClick() {
  emit('click');
}
</script>

<template>
  <v-btn
    id="create-list-button"
    color="default"
    density="compact"
    icon="mdi-plus"
    rounded="circle"
    size="small"
    @click.stop
    @click="handleCreateListDialogClick"
  />
  <v-tooltip activator="#create-list-button" location="bottom"
    ><span class="text-caption">Add list to this space</span></v-tooltip
  >

  <v-dialog
    v-model="createListDialog"
    activator="#create-list-button"
    width="400"
  >
    <v-form ref="createListForm" @submit.prevent="createList">
      <v-card :loading="createListLoading">
        <template v-slot:loader="{ isActive }">
          <v-progress-linear
            :active="isActive"
            color="primary"
            height="4"
            indeterminate
          ></v-progress-linear>
        </template>
        <v-card-title class="text-body-2 font-weight-medium"
          >Create List in {{ selectedSpace?.name }}</v-card-title
        >
        <v-divider />
        <v-card-text>
          <v-text-field
            v-model="createListData.name"
            prepend-inner-icon="mdi-file-cabinet"
            single-line
            label="List Name"
            :rules="[validation.rules.required]"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="default"
            @click="closeCreateListDialog()"
            :disabled="createListLoading"
            rounded="xl"
            class="text-capitalize"
            >Cancel</v-btn
          >
          <v-btn
            variant="flat"
            :disabled="createListLoading"
            type="submit"
            rounded="xl"
            class="text-capitalize"
            >Create</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>
../../../composables/services/lists.service
