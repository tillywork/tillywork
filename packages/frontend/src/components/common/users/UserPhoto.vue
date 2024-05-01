<script setup lang="ts">
const props = defineProps<{
  photo?: string;
  icon?: string;
  color?: string;
  style?: string;
  size?: string;
}>();
</script>

<template>
  <v-avatar density="comfortable" :size="size ?? 'small'">
    <v-img v-if="props.photo" :src="props.photo" v-bind:style="props.style" />
    <v-icon
      v-else
      :icon="props.icon ?? 'mdi-account-circle'"
      :color="props.color"
    />
  </v-avatar>
</template>
