<script setup lang="ts">
import { useUsersService } from '@/services/useUsersService';
import stringUtils from '@/utils/string';
import { cloneDeep } from 'lodash';

import UserAvatar from './UserAvatar.vue';
import SelectedUsersDisplay from './SelectedUsersDisplay.vue';
import UserListItem from './UserListItem.vue';
import type { User } from '@tillywork/shared';

type Size = 'x-small' | 'small' | 'default' | number;

interface Props {
  users: User[];
  size?: Size;
  contentClass?: string;
  showFirstNames?: boolean;
  label?: string;
  tooltip?: string;
  fill?: boolean;
  textField?: boolean;
  returnId?: boolean;
  icon?: string;
  returnString?: boolean;
  multiple?: boolean;
  minSearchChars?: number;
  loading?: boolean;
  rounded?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'x-small',
  showFirstNames: false,
  fill: false,
  textField: false,
  returnId: false,
  multiple: true,
  minSearchChars: 1,
  loading: false,
  rounded: 'pill',
});

const userMenu = defineModel('menu', { type: Boolean, default: false });
const value = defineModel<User[] | (number | string)[] | null>({
  default: () => [],
});

const { getUserFullName } = useUsersService();

const searchTerm = ref('');

const selectedUsers = computed({
  get: () => getSelectedUsersFromModel(),
  set: (newValue: User[] | User) => {
    if (!props.multiple) {
      let selectedUser = newValue as User;

      if (Array.isArray(newValue)) {
        selectedUser = newValue[0];
      }

      if (!selectedUser) {
        value.value = null;
        return;
      }

      value.value = props.returnId
        ? props.returnString
          ? [selectedUser.id.toString()]
          : [selectedUser.id]
        : [cloneDeep(selectedUser)];

      return;
    }

    let selectedUsers = newValue as User[];
    value.value = props.returnId
      ? selectedUsers.map((user) =>
          props.returnString ? user.id.toString() : user.id
        )
      : cloneDeep(selectedUsers);
  },
});

const searchedUsers = computed(() => {
  if (searchTerm.value.length < props.minSearchChars) {
    return props.users;
  }

  return props.users.filter(
    (user) =>
      stringUtils.fuzzySearch(searchTerm.value, getUserFullName(user)) ||
      stringUtils.fuzzySearch(searchTerm.value, user.email)
  );
});

// Methods
function toggleUserSelection(user: User) {
  if (props.multiple) {
    const index = selectedUsers.value.findIndex((u) => u.id === user.id);
    if (index === -1) {
      selectedUsers.value = [...selectedUsers.value, user];
    } else {
      selectedUsers.value = selectedUsers.value.filter((u) => u.id !== user.id);
    }
  } else {
    selectedUsers.value = isUserSelected(user) ? [] : [user];
    userMenu.value = false;
  }
}

function isUserSelected(user: User): boolean {
  return selectedUsers.value.some((u) => u.id === user.id);
}

function getSelectedUsersFromModel(): User[] {
  if (props.returnId) {
    const ids = Array.isArray(value.value) ? value.value : [value.value];
    return ids
      .map((id) => props.users.find((user) => id && user.id == +id))
      .filter((user): user is User => user !== undefined);
  }
  return Array.isArray(value.value)
    ? cloneDeep(value.value as User[])
    : value.value
    ? [cloneDeep(value.value as User)]
    : [];
}

defineExpose({ userMenu });
</script>

<template>
  <v-menu v-model="userMenu" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-autocomplete
        v-if="textField"
        :width="!fill ? 90 : undefined"
        v-bind="$attrs"
        v-model="selectedUsers"
        v-model:search="searchTerm"
        :label="label ?? 'Select'"
        placeholder="Search..."
        :items="users"
        closable-chips
        clearable
        item-value="id"
        :custom-filter="
          (_, q, item) => {
            return (
              stringUtils.fuzzySearch(q, getUserFullName(item?.raw)) ||
              stringUtils.fuzzySearch(q, item?.raw.email)
            );
          }
        "
        return-object
        single-line
        hide-details
        autocomplete="off"
        :multiple
        :loading="loading"
        :prepend-inner-icon="icon"
        chips
        auto-select-first
        :rounded
      >
        <template #chip="{ item, props: chipProps }">
          <UserAvatar v-bind="chipProps" :user="item.raw" :size="size" chip />
        </template>
        <template #item="{ item, props: itemProps }">
          <UserListItem
            v-bind="itemProps"
            :title="null"
            :user="item.raw"
            :selected="isUserSelected(item.raw)"
            :size
          />
        </template>
      </v-autocomplete>

      <div
        v-else
        class="d-flex align-center justify-start rounded-md cursor-pointer fill-height"
        :class="[contentClass, { 'flex-fill': fill }]"
        v-bind="menuProps"
        @click.prevent
      >
        <v-tooltip activator="parent" location="top" v-if="!fill">
          {{ tooltip ?? label }}
        </v-tooltip>
        <SelectedUsersDisplay
          :users="selectedUsers"
          :size
          :label
          :icon
          :fill
          :rounded
        />
      </div>
    </template>

    <v-card width="250">
      <div class="d-flex align-center">
        <v-text-field
          v-if="!textField"
          v-model="searchTerm"
          placeholder="Search..."
          hide-details
          single-line
          autofocus
          variant="filled"
          rounded="0"
          class="flex-grow-1"
        />
      </div>

      <v-list>
        <template v-for="user in searchedUsers" :key="user.id">
          <UserListItem
            @click="toggleUserSelection(user)"
            :active="isUserSelected(user)"
            class="text-truncate"
            :user
            :selected="isUserSelected(user)"
            :size
          />
        </template>
        <template v-if="!searchedUsers.length">
          <v-list-item>
            <v-list-item-title>No users found.</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>
