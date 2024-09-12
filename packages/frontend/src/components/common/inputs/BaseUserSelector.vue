<script setup lang="ts">
import { useUsersService } from '@/services/useUsersService';
import stringUtils from '@/utils/string';
import { type User } from '../users/types';
import { cloneDeep } from 'lodash';

interface Props {
  users: User[];
  size?: number | 'x-small' | 'small' | 'default';
  contentClass?: string;
  showFirstNames?: boolean;
  label?: string;
  fill?: boolean;
  textField?: boolean;
  returnId?: boolean;
  icon?: string;
  returnString?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'x-small',
  showFirstNames: false,
  fill: false,
  textField: false,
  returnId: false,
  icon: 'mdi-account',
});

const userMenu = defineModel('menu', { type: Boolean, default: false });
const value = defineModel<User[] | (number | string)[]>({ default: () => [] });

const { getUserFullName } = useUsersService();
const searchTerm = ref('');
const selectedUsers = ref<User[]>(getSelectedUsersFromModel());

const searchedUsers = computed(() =>
  props.users.filter(
    (user) =>
      stringUtils.fuzzySearch(searchTerm.value, getUserFullName(user)) ||
      stringUtils.fuzzySearch(searchTerm.value, user.email)
  )
);

const formattedUsers = computed(() =>
  props.users.map((user) => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
  }))
);

function toggleUserSelection(user: User) {
  const index = selectedUsers.value.findIndex((u) => u.id === user.id);
  if (index === -1) {
    selectedUsers.value.push(user);
  } else {
    selectedUsers.value.splice(index, 1);
  }
}

function isUserSelected(user: User): boolean {
  return selectedUsers.value.some((u) => u.id === user.id);
}

function getSelectedUsersFromModel(): User[] {
  if (props.returnId) {
    return (value.value as number[])
      .map((id) => props.users.find((user) => user.id == id))
      .filter((user): user is User => user !== undefined);
  }
  return cloneDeep(value.value as User[]);
}

watch(
  selectedUsers,
  (newValue) => {
    value.value = props.returnId
      ? newValue.map((user) =>
          props.returnString ? user.id.toString() : user.id
        )
      : cloneDeep(newValue);
  },
  { deep: true }
);

defineExpose({ userMenu });
</script>

<template>
  <v-menu v-model="userMenu" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-autocomplete
        v-if="textField"
        v-model="selectedUsers"
        :label="label ?? 'Select'"
        placeholder="Search..."
        :items="formattedUsers"
        item-title="fullName"
        item-value="id"
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
                v-if="isUserSelected(item.raw)"
                icon="mdi-check"
                size="12"
              />
            </template>
          </v-list-item>
        </template>
      </v-autocomplete>
      <div
        v-else
        class="d-flex align-center justify-start rounded-md cursor-pointer fill-height"
        :class="[contentClass, { 'flex-fill': fill }]"
        v-bind="menuProps"
        @click.prevent
      >
        <template v-if="selectedUsers.length === 0">
          <base-icon-btn
            v-if="!label"
            v-bind="menuProps"
            :icon="icon"
            @click.prevent
          />
          <v-btn
            v-else
            v-bind="menuProps"
            variant="text"
            size="small"
            color="surface-dark"
            class="text-none text-caption font-weight-regular"
            @click.prevent
          >
            <template #prepend>
              <v-icon :icon="icon" size="small" />
            </template>
            {{ label }}
          </v-btn>
        </template>
        <template v-else>
          <div :class="fill ? 'px-2' : ''">
            <v-tooltip
              v-for="(selectedUser, index) in selectedUsers"
              :key="selectedUser.email + 'selected-user'"
              location="bottom"
            >
              <template #activator="{ props: tooltipProps }">
                <base-avatar
                  v-bind="tooltipProps"
                  :photo="selectedUser.photo"
                  :text="getUserFullName(selectedUser)"
                  class="text-xs"
                  :class="{ 'ms-n1': index > 0 }"
                  :size
                  :style="{ zIndex: 100 - index }"
                />
              </template>
              <span class="text-caption">{{
                getUserFullName(selectedUser)
              }}</span>
            </v-tooltip>
          </div>
        </template>
      </div>
    </template>
    <v-card width="250">
      <v-text-field
        v-if="!textField"
        v-model="searchTerm"
        placeholder="Search..."
        hide-details
        single-line
        autofocus
        variant="filled"
      />
      <v-list>
        <v-list-item
          v-for="user in searchedUsers"
          :key="user.id"
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
            <v-icon v-if="isUserSelected(user)" icon="mdi-check" size="12" />
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>
