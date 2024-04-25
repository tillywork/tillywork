<script setup lang="ts">
import {
  useUsersService,
  type UsersData,
} from '@/composables/services/useUsersService';
import { onMounted, ref } from 'vue';
import type { User } from '@/components/common/users/types';
import UserPhoto from '../users/UserPhoto.vue';

const usersData = ref<UsersData>();
const usersService = useUsersService();
const selectedUsers = defineModel<User[]>({
  default: [],
  required: true,
});

const toggleUserSelection = (user: User) => {
  const index = selectedUsers.value.findIndex((u) => u.id === user.id);

  if (index === -1) {
    // User is not in the array, add them
    // Can't use push(user) since reactivity breaks
    selectedUsers.value = [...selectedUsers.value, user];
  } else {
    // User is in the array, remove them
    // Can't use splice since reactivity breaks
    // So we hack around it :)
    selectedUsers.value = [
      ...selectedUsers.value.slice(0, index),
      ...selectedUsers.value.slice(index + 1),
    ];
  }
};

const isUserSelected = (user: User) => {
  const index = selectedUsers.value.findIndex((u) => u.id === user.id);
  return index !== -1;
};

onMounted(async () => {
  usersData.value = await usersService.getUsers();
});
</script>

<template>
  <v-menu :close-on-content-click="false" offset="5">
    <template #activator="{ props: menuProps }">
      <div
        class="d-flex align-center justify-start rounded-md px-1"
        v-bind="menuProps"
      >
        <v-btn
          icon="mdi-shape-square-rounded-plus"
          density="compact"
          color="default"
          rounded="circle"
          variant="text"
          v-if="!selectedUsers || selectedUsers.length === 0"
        >
        </v-btn>
        <template v-else>
          <template
            v-for="selectedUser in selectedUsers"
            :key="selectedUser.email"
          >
            <v-tooltip location="bottom">
              <template #activator="{ props: tooltipProps }">
                <user-photo
                  v-bind="tooltipProps"
                  :photo="selectedUser.photo"
                  class="me-n2"
                />
              </template>
              <span class="text-caption">{{
                selectedUser.firstName + ' ' + selectedUser.lastName
              }}</span>
            </v-tooltip>
          </template>
        </template>
      </div>
    </template>
    <v-card>
      <v-list nav density="compact">
        <template v-for="user in usersData?.users" :key="user.email">
          <v-list-item @click="toggleUserSelection(user)" slim>
            <template #prepend>
              <v-list-item-action start>
                <user-photo
                  :photo="user.photo"
                  :color="isUserSelected(user) ? 'primary' : ''"
                  class="ms-1"
                />
              </v-list-item-action>
            </template>
            <v-list-item-title
              class="user-select-none"
              :class="isUserSelected(user) ? 'font-weight-bold' : ''"
            >
              {{ user.firstName + ' ' + user.lastName }}
            </v-list-item-title>
            <template #append>
              <v-icon icon="mdi-check" size="12" v-if="isUserSelected(user)" />
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>
@/components/common/users/types