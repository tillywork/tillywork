<script setup lang="ts">
import BaseAvatar from '@/components/common/base/BaseAvatar.vue';
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
  <v-list-item v-if="user">
    <template #prepend>
      <base-avatar
        :photo="user.photo"
        :text="printUserFullName(user)"
        :size="avatarSize ?? 'default'"
        class="text-caption"
      />
    </template>
    <v-list-item-title>{{ printUserFullName(user) }}</v-list-item-title>
    <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
    <template #append v-if="slots['append']">
      <slot name="append"></slot>
    </template>
  </v-list-item>
</template>
