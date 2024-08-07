<script setup lang="ts">
import { useProjectsService } from '@/services/useProjectsService';
import { useAuthStore } from '@/stores/auth';
import { useSnackbarStore } from '@/stores/snackbar';

const { project: selectedProject } = storeToRefs(useAuthStore());
const { useGetProject } = useProjectsService();
const { copy } = useClipboard();
const { showSnackbar } = useSnackbarStore();

const { data: project } = useGetProject({
  projectId: selectedProject.value!.id,
});

const inviteLink = computed(
  () =>
    `${window.location.protocol}//${window.location.host}/invite/${project.value?.inviteCode}`
);

function copyInviteLink() {
  copy(inviteLink.value)
    .then(() => {
      showSnackbar({
        message: 'Invite link copied to clipboard.',
        timeout: 2000,
      });
    })
    .catch(() => {
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
      });
    });
}
</script>

<template>
  <v-card v-if="project">
    <v-card-title class="text-body-2 px-0"> Invite link </v-card-title>
    <v-card-subtitle class="px-0">
      Share this link with team members you want to join your project.
    </v-card-subtitle>
    <v-card-item class="px-0">
      <v-text-field readonly hide-details :model-value="inviteLink" width="400">
        <template #append-inner>
          <v-btn
            prepend-icon="mdi-content-copy"
            class="text-capitalize"
            size="small"
            variant="tonal"
            @click="copyInviteLink"
            >Copy</v-btn
          >
        </template>
      </v-text-field>
    </v-card-item>
  </v-card>
</template>
