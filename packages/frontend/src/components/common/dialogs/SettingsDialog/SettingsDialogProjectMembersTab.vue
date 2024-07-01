<script setup lang="ts">
import { useProjectUsersService } from '@/composables/services/useProjectUsersService';
import ProjectInvitationLink from '../../projects/ProjectInvitationLink.vue';
import { useDate } from '@/composables/useDate';
import { useAuthStore } from '@/stores/auth';

const { dayjs } = useDate();
const { workspace } = storeToRefs(useAuthStore());
const { useProjectUsersQuery } = useProjectUsersService();

const { data: projectUsers } = useProjectUsersQuery({
  projectId: workspace.value!.projectId,
});
</script>

<template>
  <v-card>
    <v-card-title> Project Members </v-card-title>
    <v-card-subtitle> Manage who has access to your project. </v-card-subtitle>
    <v-card-item>
      <v-divider class="my-4" />
    </v-card-item>
    <v-card-item>
      <project-invitation-link />
    </v-card-item>
    <v-card-item>
      <v-divider class="my-4" />
    </v-card-item>
    <v-card-item v-if="projectUsers">
      <v-card-title class="text-body-2"> Manage members </v-card-title>
      <v-card-subtitle class="text-caption">
        {{ projectUsers.length }} active member{{
          projectUsers.length > 1 ? 's' : ''
        }}
      </v-card-subtitle>
      <v-list>
        <template v-for="user in projectUsers" :key="user.id">
          <v-list-item class="px-1">
            <template #prepend>
              <base-avatar
                :text="`${user.user.firstName} ${user.user.lastName}`"
                :photo="user.user.photo"
                class="me-2"
              />
            </template>
            <v-list-item-title>{{ user.user.email }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption">
              Joined
              {{ dayjs(user.createdAt).fromNow() }}
            </v-list-item-subtitle>
            <template #append v-if="false">
              <base-icon-btn icon="mdi-dots-vertical" />
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card-item>
  </v-card>
</template>
