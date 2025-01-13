<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useSnackbarStore } from '@/stores/snackbar';
import { useProjectsService } from '@/services/useProjectsService';

definePage({
  meta: {
    hideNavigationDrawer: true,
  },
});

const router = useRouter();
const route = useRoute('/invite/[inviteCode]');
const inviteCode = computed(() => route.params.inviteCode);

const { useGetProjectByInviteCode } = useProjectsService();
const { data: project } = useGetProjectByInviteCode({ inviteCode });

const { isAuthenticated, joinInvitation } = useAuthStore();
const { showSnackbar } = useSnackbarStore();

async function handleJoin() {
  if (isAuthenticated()) {
    try {
      await joinInvitation(inviteCode.value);
      router.push({ path: '/' });
    } catch (error) {
      const errorObj = (error as any).value ?? error;
      console.error(errorObj);

      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
      });
    }
  } else {
    router.push({
      path: '/register',
      query: { inviteCode: inviteCode.value },
    });
  }
}
</script>

<template>
  <v-container class="fill-height">
    <v-row v-if="project">
      <v-col class="d-flex justify-center">
        <v-card class="text-center pa-8" color="accent" width="450">
          <base-avatar
            :text="project.name"
            size="x-large"
            class="text-body-3 mb-1"
            rounded="md"
          />
          <v-card-title>Join {{ project.name }}</v-card-title>
          <v-card-subtitle class="text-wrap">
            You've been invited to join {{ project.name }}
          </v-card-subtitle>
          <v-card-actions class="mt-3">
            <v-btn
              class="flex-fill text-capitalize text-body-3"
              variant="flat"
              size="large"
              @click="handleJoin"
            >
              Join
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
