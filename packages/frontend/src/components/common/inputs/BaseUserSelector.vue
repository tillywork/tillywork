<script setup lang="ts">
import type { User } from '@/components/common/users/types';
import BaseAvatar from '../base/BaseAvatar.vue';
import BaseIconBtn from '../base/BaseIconBtn.vue';

const value = defineModel<User[]>({
  default: [],
});
const userMenu = defineModel('menu', {
  default: false,
});
defineExpose({
  userMenu,
});
defineProps<{
  users: User[];
  activatorHoverText?: string;
  size?: number | 'x-small' | 'small' | 'default';
  contentClass?: string;
  showFirstNames?: boolean;
  label?: string;
}>();

const toggleUserSelection = (user: User) => {
  const index = value.value.findIndex((u) => u.id === user.id);

  if (index === -1) {
    // User is not in the array, add them
    value.value = [...value.value, user];
  } else {
    // User is in the array, remove them
    value.value = [
      ...value.value.slice(0, index),
      ...value.value.slice(index + 1),
    ];
  }
};

const isUserSelected = (user: User) => {
  const index = value.value.findIndex((u) => u.id === user.id);
  return index !== -1;
};
</script>

<template>
  <v-menu v-model="userMenu" :close-on-content-click="false" offset="3">
    <template #activator="{ props: menuProps }">
      <div
        class="d-flex align-center justify-start rounded-md px-1 cursor-pointer"
        :class="contentClass"
        v-bind="menuProps"
      >
        <div class="me-n1" v-if="value.length === 0">
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <base-icon-btn icon="mdi-account" v-if="!label" />
              <v-btn
                v-if="label"
                v-bind="props"
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
            </template>
            <span class="text-caption">{{
              activatorHoverText ?? 'Select users'
            }}</span>
          </v-tooltip>
        </div>
        <template v-else>
          <div class="ms-3 mt-1">
            <template
              v-for="(selectedUser, index) in value"
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
              <span class="ms-2 text-body-2">
                {{ value.map((user) => user.firstName).join(', ') }}
              </span>
            </template>
          </div>
        </template>
      </div>
    </template>
    <v-card width="250" color="accent">
      <v-list nav density="compact" class="bg-accent">
        <template
          v-for="user in users"
          :key="user.email + 'list-item' + isUserSelected(user)"
        >
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
