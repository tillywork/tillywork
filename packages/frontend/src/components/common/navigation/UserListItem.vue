<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const slots = defineSlots();
defineProps<{
  avatarSize?: 'x-small' | 'small' | 'default';
}>();

function printUserFullName(user: { firstName: string; lastName: string }) {
  return `${user.firstName} ${user.lastName}`;
}
</script>

<template>
  <v-list-item v-if="user" class="user-list-item">
    <template #prepend>
      <base-avatar
        :photo="user.photo"
        :text="printUserFullName(user)"
        :size="avatarSize ?? 'default'"
        class="text-caption"
      />
    </template>
    <v-list-item-title class="text-truncate">
      {{ printUserFullName(user) }}
    </v-list-item-title>
    <v-list-item-subtitle class="d-block text-truncate">
      {{ user.email }}
    </v-list-item-subtitle>
    <template #append v-if="slots['append']">
      <slot name="append"></slot>
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
