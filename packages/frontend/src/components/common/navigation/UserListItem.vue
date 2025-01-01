<script setup lang="ts">
import { useUsersService } from '@/services/useUsersService';
import { useAuthStore } from '@/stores/auth';

const { getUserFullName } = useUsersService();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

defineProps<{
  avatarSize?: 'x-small' | 'small' | 'default';
}>();
</script>

<template>
  <!-- User content -->
  <v-list-item v-if="user" class="user-list-item">
    <template #prepend>
      <base-avatar
        :photo="user.photo"
        :text="getUserFullName(user)"
        :size="avatarSize ?? 'default'"
        class="text-xs"
      />
    </template>
    <v-list-item-title class="text-truncate">
      {{ getUserFullName(user) }}
    </v-list-item-title>
    <template #append>
      <v-icon icon="mdi-dots-vertical" />
    </template>
  </v-list-item>
</template>

<style lang="scss">
.user-list-item {
  .v-list-item__append > .v-icon ~ .v-list-item__spacer {
    width: 12px;
  }
}
</style>
