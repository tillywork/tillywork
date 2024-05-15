<script setup lang="ts">
import stringUtils from '@/utils/string';

defineProps<{
  photo?: string;
  text?: string;
  color?: string;
  style?: any;
  size?: number | 'x-small' | 'small' | 'default';
  rounded?: string;
}>();
</script>

<template>
  <v-avatar
    :style="style"
    :image="photo"
    :text="text ? stringUtils.getInitials(text) : undefined"
    :color="!photo ? color ?? 'secondary' : undefined"
    :size="size ?? 28"
    :rounded="rounded"
    class="user-select-none"
  />
</template>
