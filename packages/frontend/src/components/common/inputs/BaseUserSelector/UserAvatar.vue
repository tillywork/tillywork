<script setup lang="ts">
import { useUsersService } from '@/services/useUsersService';
import type { User } from '@tillywork/shared';

interface Props {
  user: User;
  size?: 'x-small' | 'small' | 'default' | number;
  chip?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'x-small',
  chip: false,
});

const { getUserFullName } = useUsersService();
</script>

<template>
  <v-chip v-if="chip" rounded="pill">
    <template #prepend>
      <base-avatar
        :photo="user.photo"
        :text="getUserFullName(user)"
        class="text-xs ms-n1"
        :size
      />
    </template>
    <span class="text-caption ms-2">{{ getUserFullName(user) }}</span>
  </v-chip>

  <base-avatar
    v-else
    :photo="user.photo"
    :text="getUserFullName(user)"
    class="text-xs"
    :size
  />
</template>
