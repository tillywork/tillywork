<script setup lang="ts">
import { useProjectUsersService } from '@/services/useProjectUsersService';

import { useAuthStore } from '@/stores/auth';
import { useDialogStore } from '@/stores/dialog';
import { useSnackbarStore } from '@/stores/snackbar';
import { useAccessControlStore } from '@/stores/access.control';

import { useTryCatch } from '@/composables/useTryCatch';

import { dayjs, PermissionLevel, type ProjectUser } from '@tillywork/shared';
import type { ContextMenuItem } from '../base/ContextMenu/types';

import ProjectInvitationLink from '../projects/ProjectInvitationLink.vue';
import MenuWrapper from '../base/ContextMenu/MenuWrapper.vue';
import { DIALOGS } from '../dialogs/types';

import _ from 'lodash';

const { workspace } = storeToRefs(useAuthStore());
const dialog = useDialogStore();
const { showSnackbar } = useSnackbarStore();

const { useProjectUsersQuery, useDeleteProjectUser } = useProjectUsersService();

const { tryCatch } = useTryCatch();

const { data: projectUsers } = useProjectUsersQuery({
  projectId: workspace.value!.projectId,
});

const { mutateAsync: deleteProjectUser } = useDeleteProjectUser();

const { hasPermission } = useAccessControlStore();

function getProjectUserMenuItems(projectUser: ProjectUser): ContextMenuItem[] {
  const userMenuItems: ContextMenuItem[] = [
    {
      title: 'Remove member',
      icon: 'mdi-delete',
      action: () => handleDeleteProjectUser(projectUser),
    },
  ];

  return userMenuItems;
}

function handleDeleteProjectUser(projectUser: ProjectUser) {
  if (projectUser.role === 'owner') {
    showSnackbar({
      message: 'You cannot remove the project owner from the project.',
      color: 'error',
    });

    return;
  }

  dialog.openDialog({
    dialog: DIALOGS.CONFIRM,
    data: {
      title: 'Remove member',
      message: 'Are you sure you want to remove this member?',
      onConfirm: () =>
        tryCatch(() =>
          deleteProjectUser({
            projectId: workspace.value!.projectId,
            projectUserId: projectUser.id,
          })
        ),
    },
  });
}
</script>

<template>
  <div class="user-select-none">
    <h3>Project Members</h3>
    <p class="text-subtitle-2 text-color-subtitle">
      Manage who has access to your project.
    </p>
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

    <v-list class="pa-2">
      <template v-for="projectUser in projectUsers" :key="projectUser.id">
        <v-list-item class="px-1">
          <!-- ~ Avatar -->
          <template #prepend>
            <v-menu
              v-if="hasPermission('project', workspace!.projectId, PermissionLevel.OWNER)"
            >
              <template #activator="{ props }">
                <base-icon-btn
                  v-bind="props"
                  class="me-2"
                  icon="mdi-dots-vertical"
                />
              </template>
              <template #default="{ isActive }">
                <menu-wrapper
                  :open="isActive"
                  :items="getProjectUserMenuItems(projectUser)"
                />
              </template>
            </v-menu>
            <base-avatar
              :text="`${projectUser.user.firstName} ${projectUser.user.lastName}`"
              :photo="projectUser.user.photo"
              class="me-2"
            />
          </template>

          <!-- ~ Information -->
          <v-list-item-title>
            {{ projectUser.user.firstName }} {{ projectUser.user.lastName }}
            <span class="text-color-subtitle">
              ({{ _.upperFirst(projectUser.role) }})
            </span>
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption user-select-none">
            Joined
            {{ dayjs(projectUser.createdAt).fromNow() }}
          </v-list-item-subtitle>
        </v-list-item>
      </template>
    </v-list>
  </template>
</template>
