<script setup lang="ts">
import type { User } from '@/components/common/users/types';

const userMenu = defineModel('menu', {
  default: false,
});
const value = defineModel<User[]>({
  default: [],
});
const selectedUsers = ref(value.value ?? []);

defineExpose({
  userMenu,
});

defineProps<{
  users: User[];
  size?: number | 'x-small' | 'small' | 'default';
  contentClass?: string;
  showFirstNames?: boolean;
  label?: string;
  fill?: boolean;
}>();

const toggleUserSelection = (user: User) => {
  const index = selectedUsers.value.findIndex((u) => u.id === user.id);

  if (index === -1) {
    // User is not in the array, add them
    selectedUsers.value = [...selectedUsers.value, user];
  } else {
    // User is in the array, remove them
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

watch(selectedUsers, (v) => {
  value.value = [...v];
});
</script>

<template>
  <v-menu v-model="userMenu" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <div
        class="d-flex align-center justify-start rounded-md px-1 cursor-pointer fill-height"
        :class="`${contentClass ? contentClass : ''} ${
          fill ? 'flex-fill' : ''
        }`"
        v-bind="menuProps"
      >
        <div class="me-n1" v-if="selectedUsers.length === 0">
          <base-icon-btn v-bind="menuProps" icon="mdi-account" v-if="!label" />
          <v-btn
            v-if="label"
            v-bind="menuProps"
            variant="text"
            size="small"
            color="surface-dark"
            class="text-body-2"
          >
            <template #prepend>
              <v-icon icon="mdi-account" :size="size ?? 'small'" />
            </template>
            {{ label }}
          </v-btn>
        </div>
        <template v-else>
          <div class="ms-3 mt-1">
            <template
              v-for="(selectedUser, index) in selectedUsers"
              :key="selectedUser.email + 'selected-user'"
            >
              <v-tooltip location="bottom">
                <template #activator="{ props: tooltipProps }">
                  <base-avatar
                    v-bind="tooltipProps"
                    :photo="selectedUser.photo"
                    :text="selectedUser.firstName + ' ' + selectedUser.lastName"
                    class="ms-n1 text-caption"
                    :size="size ?? 20"
                    :style="`z-index: ${100 - index}`"
                  />
                </template>
                <span class="text-caption">{{
                  selectedUser.firstName + ' ' + selectedUser.lastName
                }}</span>
              </v-tooltip>
            </template>
            <template v-if="showFirstNames">
              <span class="ms-2 text-body-2 user-select-none">
                {{ selectedUsers.map((user) => user.firstName).join(', ') }}
              </span>
            </template>
          </div>
        </template>
      </div>
    </template>
    <v-card width="250">
      <v-list>
        <template
          v-for="user in users"
          :key="user.email + 'list-item' + isUserSelected(user)"
        >
          <v-list-item
            @click="toggleUserSelection(user)"
            :active="isUserSelected(user)"
          >
            <template #prepend>
              <v-list-item-action start>
                <base-avatar
                  :photo="user.photo"
                  :text="user.firstName + ' ' + user.lastName"
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
