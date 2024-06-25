<script setup lang="ts">
import { useUsersService } from '@/composables/services/useUsersService';
import stringUtils from '@/utils/string';
import { type User } from '../users/types';
import { cloneDeep } from 'lodash';

const userMenu = defineModel('menu', {
  default: false,
});
const value = defineModel<User[] | number[]>({
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
  textField?: boolean;
  returnId?: boolean;
  icon?: string;
}>();

const { getUserFullName } = useUsersService();
const searchTerm = ref('');
const searchedUsers = computed(() =>
  props.users.filter(
    (user) =>
      // Searches for a matching name.
      stringUtils.fuzzySearch(searchTerm.value, getUserFullName(user)) ||
      // Searches for a matching email.
      stringUtils.fuzzySearch(searchTerm.value, user.email)
  )
);
const selectedUsers = ref<User[]>(getSelectedUsersFromModel());

const toggleUserSelection = (user: User) => {
  if (!isUserSelected(user)) {
    // User is not in the array, add them
    selectedUsers.value = [...selectedUsers.value, user];
  } else {
    const index = selectedUsers.value.findIndex((u) => u.id === user.id);

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

function getSelectedUsersFromModel() {
  if (props.returnId) {
    return cloneDeep(
      value.value.map((id) =>
        props.users.find((user) => user.id === id)
      ) as User[]
    );
  } else {
    return cloneDeep(value.value as User[]);
  }
}

watch(selectedUsers, (v) => {
  if (props.returnId) {
    value.value = [...v.map((user) => cloneDeep(user.id))];
  } else {
    value.value = cloneDeep(v);
  }
});
</script>

<template>
  <v-menu v-model="userMenu" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <template v-if="textField">
        <v-autocomplete
          :label="label ?? 'Select'"
          placeholder="Search..."
          v-model="selectedUsers"
          :items="
            users.map((user) => {
              return {
                ...user,
                fullName: `${user.firstName} ${user.lastName}`,
              };
            })
          "
          item-title="fullName"
          return-object
          single-line
          hide-details
          autocomplete="off"
          multiple
          width="90"
          :prepend-inner-icon="icon"
          chips
          auto-select-first
        >
          <template #chip="{ item, props }">
            <v-chip v-bind="props" rounded="large">
              <template #prepend>
                <base-avatar
                  :photo="item.raw.photo"
                  :text="getUserFullName(item.raw)"
                  class="text-xs ms-n1"
                  size="x-small"
                />
              </template>
              <span class="text-caption ms-2">{{
                getUserFullName(item.raw)
              }}</span>
            </v-chip>
          </template>
          <template #item="{ item, props }">
            <v-list-item v-bind="props" class="text-truncate">
              <template #prepend>
                <v-list-item-action start>
                  <base-avatar
                    :photo="item.raw.photo"
                    :text="getUserFullName(item.raw)"
                    class="ms-1 text-xs"
                    size="x-small"
                  />
                </v-list-item-action>
              </template>
              <template #append>
                <v-icon
                  icon="mdi-check"
                  size="12"
                  v-if="isUserSelected(item.raw)"
                />
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>
      </template>
      <template v-else>
        <div
          class="d-flex align-center justify-start rounded-md cursor-pointer fill-height"
          :class="`${contentClass ? contentClass : ''} ${
            fill ? 'flex-fill' : ''
          }`"
          v-bind="menuProps"
          @click.prevent
        >
          <div v-if="selectedUsers.length === 0">
            <base-icon-btn
              v-bind="menuProps"
              :icon="icon ?? 'mdi-account'"
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
                <v-icon :icon="icon ?? 'mdi-account'" size="small" />
              </template>
              {{ label }}
            </v-btn>
          </div>
          <template v-else>
            <div @click.prevent>
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
                      class="text-xs"
                      :class="index > 0 ? 'ms-n1' : ''"
                      :size
                      :style="`z-index: ${100 - index}`"
                    />
                  </template>
                  <span class="text-caption">{{
                    getUserFullName(selectedUser)
                  }}</span>
                </v-tooltip>
              </template>
            </div>
          </template>
        </div>
      </template>
    </template>
    <v-card width="250">
      <v-text-field
        v-if="!textField"
        placeholder="Search..."
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
            class="text-truncate"
          >
            <template #prepend>
              <v-list-item-action start>
                <base-avatar
                  :photo="user.photo"
                  :text="getUserFullName(user)"
                  class="text-xs"
                />
              </v-list-item-action>
            </template>
            <v-list-item-title class="user-select-none">
              {{ getUserFullName(user) }}
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
