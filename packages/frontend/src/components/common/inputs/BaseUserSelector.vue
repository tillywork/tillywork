<script setup lang="ts">
import type { User } from '@/components/common/users/types';
import BaseUserPhoto from '../users/BaseUserPhoto.vue';
import { ref } from 'vue';

const userMenu = ref(false);
defineExpose({
  userMenu,
});
const props = defineProps<{
  users: User[];
  selected?: User[];
}>();
const emit = defineEmits(['update:select'])
const selectedUsers = ref<User[]>([...(props.selected ?? [])]);

const toggleUserSelection = (user: User) => {
  const index = selectedUsers.value.findIndex((u) => u.id === user.id);

  if (index === -1) {
    // User is not in the array, add them
    selectedUsers.value.push(user)
  } else {
    // User is in the array, remove them
    selectedUsers.value.splice(index, 1)
  }

  emit('update:select', selectedUsers.value)
};

const isUserSelected = (user: User) => {
  const index = selectedUsers.value.findIndex((u) => u.id === user.id);
  return index !== -1;
};
</script>

<template>
  <v-menu v-model="userMenu" :close-on-content-click="false" offset="5">
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
            v-for="(selectedUser, index) in selectedUsers"
            :key="selectedUser.email"
          >
            <v-tooltip location="bottom">
              <template #activator="{ props: tooltipProps }">
                <base-user-photo
                  v-bind="tooltipProps"
                  :photo="selectedUser.photo"
                  class="me-n2"
                  :style="`z-index: ${100 - index}`"
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
    <v-card width="250" color="surface">
      <v-list nav density="compact">
        <template v-for="user in users" :key="user.email">
          <v-list-item @click="toggleUserSelection(user)" slim>
            <template #prepend>
              <v-list-item-action start>
                <base-user-photo
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
