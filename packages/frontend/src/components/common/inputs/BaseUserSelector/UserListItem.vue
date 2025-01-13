<script setup lang="ts">
import { useUsersService } from '@/services/useUsersService';
import type { User } from '@tillywork/shared';

interface Props {
  user: User;
  selected?: boolean;
  size?: 'x-small' | 'small' | 'default' | number;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  size: 'x-small',
});

const { getUserFullName } = useUsersService();
</script>

<template>
  <v-list-item>
    <template #prepend>
      <v-list-item-action start>
        <base-avatar
          :photo="user.photo"
          :text="getUserFullName(user)"
          class="text-xs"
          :size
        />
      </v-list-item-action>
    </template>

    <v-list-item-title class="user-select-none">
      {{ getUserFullName(user) }}
    </v-list-item-title>

    <template #append>
      <v-icon v-if="selected" icon="mdi-check" size="12" />
    </template>
  </v-list-item>
</template>
