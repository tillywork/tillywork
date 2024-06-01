<script setup lang="ts">
import { useUsersService } from '@/composables/services/useUsersService';
import stringUtils from '@/utils/string';
import { type User } from '../users/types';

const userMenu = defineModel('menu', {
  default: false,
});
const value = defineModel<User[]>({
  default: [],
});

defineExpose({
  userMenu,
});

const props = defineProps<{
  users: User[];
  size?: number | 'x-small' | 'small' | 'default';
  contentClass?: string;
  showFirstNames?: boolean;
  label?: string;
  fill?: boolean;
}>();

const { getUserFullName } = useUsersService();
const searchTerm = ref('');
const searchedUsers = computed(() =>
  props.users.filter(
    (user) =>
      // Searches for a matching name.
      stringUtils.fuzzySearch(searchTerm.value, getUserFullName(user)) ||
      // Searches for a matching email.
      // HMMM: What should we prioritize, name or email searching?
      stringUtils.fuzzySearch(searchTerm.value, user.email)
  )
);
const selectedUsers = ref(value.value ?? []);

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
        @click.prevent
      >
        <div class="me-n1" v-if="selectedUsers.length === 0">
          <base-icon-btn
            v-bind="menuProps"
            icon="mdi-account"
            v-if="!label"
            @click.prevent
          />
          <v-btn
            v-if="label"
            v-bind="menuProps"
            variant="text"
            size="small"
            color="surface-dark"
            class="text-body-2"
            @click.prevent
          >
            <template #prepend>
              <v-icon icon="mdi-account" :size="size ?? 'small'" />
            </template>
            {{ label }}
          </v-btn>
        </div>
        <template v-else>
          <div class="ms-3 mt-1" @click.prevent>
            <template
              v-for="(selectedUser, index) in selectedUsers"
              :key="selectedUser.email + 'selected-user'"
            >
              <v-tooltip location="bottom">
                <template #activator="{ props: tooltipProps }">
                  <base-avatar
                    v-bind="tooltipProps"
                    :photo="selectedUser.photo"
                    :text="getUserFullName(selectedUser)"
                    class="ms-n1 text-caption"
                    :size="size ?? 20"
                    :style="`z-index: ${100 - index}`"
                  />
                </template>
                <span class="text-caption">{{
                  getUserFullName(selectedUser)
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
    <v-card width="250" v-click-outside="(searchTerm = '')">
      <v-text-field
        placeholder="Search"
        hide-details
        single-line
        autofocus
        v-model="searchTerm"
      />
      <v-list>
        <template
          v-for="user in searchedUsers"
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
                  :text="getUserFullName(user)"
                  class="ms-1 text-caption"
                />
              </v-list-item-action>
            </template>
            <v-list-item-title
              class="user-select-none"
              :class="isUserSelected(user) ? 'font-weight-bold' : ''"
            >
              {{ getUserFullName(user) }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ user.email }}
            </v-list-item-subtitle>
            <template #append>
              <v-icon icon="mdi-check" size="12" v-if="isUserSelected(user)" />
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>
