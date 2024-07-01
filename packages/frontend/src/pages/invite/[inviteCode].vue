<script setup lang="ts">
import { useProjectsService } from '@/composables/services/useProjectsService';
import RegisterForm from '@/components/common/auth/RegisterForm.vue';

definePage({
  meta: {
    requiresGuest: true,
    hideNavigationDrawer: true,
  },
});

const showForm = ref(false);
const route = useRoute('/invite/[inviteCode]');
const inviteCode = computed(() => route.params.inviteCode);

const { useGetProjectByInviteCode } = useProjectsService();
const { data: project } = useGetProjectByInviteCode({ inviteCode });
</script>

<template>
  <v-container class="fill-height" v-if="!showForm">
    <v-row v-if="project">
      <v-col class="d-flex justify-center">
        <v-card class="text-center pa-8" color="accent" width="450">
          <base-avatar
            :text="project.name"
            size="x-large"
            class="text-body-2 mb-1"
            rounded="md"
          />
          <v-card-title>Join {{ project.name }}</v-card-title>
          <v-card-subtitle class="text-wrap"
            >You've been invited to join {{ project.name }}</v-card-subtitle
          >
          <v-card-actions class="mt-3">
            <v-btn
              class="flex-fill text-capitalize text-body-2"
              variant="flat"
              size="large"
              @click="showForm = true"
              >Join</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <template v-else>
    <register-form
      :header="`Join ${project?.name}`"
      :invite-code="project?.inviteCode"
    />
  </template>
</template>
