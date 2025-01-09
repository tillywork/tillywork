<script setup lang="ts">
import { useUsersService } from '@/services/useUsersService';
import type { User } from '@tillywork/shared';

interface Props {
  users: User[];
  size?: 'x-small' | 'small' | 'default' | number;
  label?: string;
  icon?: string;
  fill?: boolean;
  rounded?: string;
}

const {
  size = 'x-small',
  icon = 'mdi-account',
  fill = false,
  rounded = 'pill',
} = defineProps<Props>();

const { getUserFullName } = useUsersService();
</script>

<template>
  <template v-if="users.length === 0">
    <base-icon-btn v-if="!label" :icon @click.prevent />
    <v-btn
      v-else
      variant="text"
      size="small"
      color="surface-dark"
      class="text-none text-caption font-weight-regular"
      :class="{
        'flex-fill h-100': fill,
        'justify-start': fill,
      }"
      :rounded
      @click.prevent
    >
      <template #prepend>
        <v-icon :icon size="small" />
      </template>
      {{ label }}
    </v-btn>
  </template>

  <div v-else :class="fill ? 'px-2' : ''">
    <v-tooltip
      v-for="(user, index) in users"
      :key="user.email + 'selected-user'"
      location="bottom"
    >
      <template #activator="{ props }">
        <base-avatar
          v-bind="props"
          :photo="user.photo"
          :text="getUserFullName(user)"
          class="text-xs"
          :class="{ 'ms-n1': index > 0 }"
          :size
          :style="{ zIndex: 100 - index }"
        />
      </template>
      <span class="text-caption">{{ getUserFullName(user) }}</span>
    </v-tooltip>
  </div>
</template>
