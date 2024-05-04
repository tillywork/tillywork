<script setup lang="ts">
const props = defineProps<{
  photo?: string;
  icon?: string;
  color?: string;
  style?: string;
  size?: string;
  border?: boolean
}>();
</script>

<template>
  <v-avatar :style="style" :image="props.photo" :icon="!props.photo ? 'mdi-account' : undefined" size="28" :class="border ? 'border' : ''" />
</template>
