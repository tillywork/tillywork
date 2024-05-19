<script setup lang="ts">
import { useSpacesService } from '../../../composables/services/useSpacesService';
import { useWorkspaceStore } from '@/stores/workspace';
import validationUtils from '@/utils/validation';
import { VForm } from 'vuetify/lib/components/index.mjs';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import BaseIconBtn from '@/components/common/base/BaseIconBtn.vue';

const workspaceStore = useWorkspaceStore();
const { selectedWorkspace } = storeToRefs(workspaceStore);

const spacesService = useSpacesService();
const createSpaceDialog = ref(false);
const createSpaceForm = ref<null | VForm>(null);
const createSpaceData = ref({
  name: '',
  workspaceId: selectedWorkspace.value?.id,
});

const queryClient = useQueryClient();
const createSpaceMutation = spacesService.useCreateSpaceMutation();

function closeCreateSpaceDialog() {
  createSpaceDialog.value = false;
}

async function createSpace() {
  if (createSpaceForm.value?.isValid) {
    createSpaceMutation.mutateAsync(createSpaceData.value).then(() => {
      createSpaceForm.value?.reset();
      closeCreateSpaceDialog();
    });
  }
}
</script>

<template>
  <base-icon-btn
    id="create-space-button"
    icon="mdi-plus"
    density="compact"
    v-tooltip:bottom="'Create space'"
  />

  <v-dialog
    v-model="createSpaceDialog"
    activator="#create-space-button"
    width="400"
  >
    <template v-slot:default>
      <v-form ref="createSpaceForm" @submit.prevent="createSpace">
        <v-card :loading="createSpaceMutation.isPending.value">
          <template v-slot:loader="{ isActive }">
            <v-progress-linear
              :active="isActive"
              color="primary"
              height="4"
              indeterminate
            ></v-progress-linear>
          </template>
          <v-card-title class="text-body-2 font-weight-medium"
            >Create Space</v-card-title
          >
          <v-divider />
          <v-card-text>
            <v-text-field
              v-model="createSpaceData.name"
              prepend-inner-icon="mdi-file-cabinet"
              single-line
              label="Space Name"
              :rules="[validationUtils.rules.required]"
            />
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="default"
              @click="closeCreateSpaceDialog()"
              :disabled="createSpaceMutation.isPending.value"
              rounded="xl"
              class="text-capitalize"
              >Cancel</v-btn
            >
            <v-btn
              variant="flat"
              :disabled="createSpaceMutation.isPending.value"
              type="submit"
              rounded="xl"
              class="text-capitalize"
              >Create</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-form>
    </template>
  </v-dialog>
</template>
