<script setup lang="ts">
import { useProjectUsersService } from '@/services/useProjectUsersService';
import ProjectInvitationLink from '../projects/ProjectInvitationLink.vue';
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
  <div class="user-select-none">
    <h3>Project Members</h3>
    <p class="text-subtitle-2">Manage who has access to your project.</p>
  </div>

  <v-divider class="my-6" />

  <project-invitation-link />
  <v-divider class="my-4" />

  <!-- ~ Current Members -->
  <template v-if="projectUsers">
    <div class="user-select-none">
      <h5>Manage members</h5>
      <p class="text-caption mb-2">
        {{ projectUsers.length }} active member{{
          projectUsers.length > 1 ? 's' : ''
        }}
      </p>
    </div>

    <v-list rounded="md" class="pa-2">
      <template v-for="user in projectUsers" :key="user.id">
        <v-list-item class="px-1">
          <!-- ~ Avatar -->
          <template #prepend>
            <base-avatar
              :text="`${user.user.firstName} ${user.user.lastName}`"
              :photo="user.user.photo"
              class="me-2"
            />
          </template>

          <!-- ~ Information -->
          <v-list-item-title>{{ user.user.email }}</v-list-item-title>
          <v-list-item-subtitle class="text-caption user-select-none">
            Joined
            {{ dayjs(user.createdAt).fromNow() }}
          </v-list-item-subtitle>

          <!-- ~ Actions -->
          <template #append v-if="false">
            <base-icon-btn icon="mdi-dots-vertical" />
          </template>
        </v-list-item>
      </template>
    </v-list>
  </template>
</template>
