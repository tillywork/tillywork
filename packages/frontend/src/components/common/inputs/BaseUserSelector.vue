<script setup lang="ts">
import type { User } from '@/components/common/users/types';
import BaseAvatar from '../base/BaseAvatar.vue';
import { ref } from 'vue';
import stringUtils from '@/utils/string';

const userMenu = ref(false);
defineExpose({
  userMenu,
});
const props = defineProps<{
  users: User[];
  selected?: User[];
  activatorHoverText?: string;
}>();
const emit = defineEmits(['update:select']);
const selectedUsers = ref<User[]>([...(props.selected ?? [])]);

const toggleUserSelection = (user: User) => {
  const index = selectedUsers.value.findIndex((u) => u.id === user.id);

  if (index === -1) {
    // User is not in the array, add them
    selectedUsers.value.push(user);
  } else {
    // User is in the array, remove them
    selectedUsers.value.splice(index, 1);
  }

  emit('update:select', selectedUsers.value);
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
        <div class="me-n1" v-if="!selectedUsers || selectedUsers.length === 0">
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="text"
                density="comfortable"
                size="small"
                icon="mdi-account"
                color="info"
              >
              </v-btn>
            </template>
            <span class="text-caption">{{
              activatorHoverText ?? 'Select users'
            }}</span>
          </v-tooltip>
        </div>
        <template v-else>
          <div class="ms-2">
            <template
              v-for="(selectedUser, index) in selectedUsers"
              :key="selectedUser.email"
            >
              <v-tooltip location="bottom">
                <template #activator="{ props: tooltipProps }">
                  <base-avatar
                    v-bind="tooltipProps"
                    :photo="selectedUser.photo"
                    :text="selectedUser.firstName + ' ' + selectedUser.lastName"
                    class="ms-n1 text-caption"
                    size="20"
                    :style="`z-index: ${100 - index}`"
                  />
                </template>
                <span class="text-caption">{{
                  selectedUser.firstName + ' ' + selectedUser.lastName
                }}</span>
              </v-tooltip>
            </template>
          </div>
        </template>
      </div>
    </template>
    <v-card width="250" color="menu">
      <v-list nav density="compact" class="bg-menu">
        <template v-for="user in users" :key="user.email">
          <v-list-item
            @click="toggleUserSelection(user)"
            slim
            :active="isUserSelected(user)"
          >
            <template #prepend>
              <v-list-item-action start>
                <base-avatar
                  :photo="user.photo"
                  :text="user.firstName + ' ' + user.lastName"
                  :color="isUserSelected(user) ? 'primary' : undefined"
                  class="ms-1 text-caption"
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
