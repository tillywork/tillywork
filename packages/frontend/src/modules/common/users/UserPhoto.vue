<script setup lang="ts">
const props = defineProps<{
  photo?: string;
  icon?: string;
  color?: string;
}>();
</script>

<template>
  <v-avatar
    density="comfortable"
    size="small"
    :variant="props.photo ? 'elevated' : 'flat'"
  >
    <v-img v-if="props.photo" :src="props.photo" />
    <v-icon
      v-else
      :icon="props.icon ?? 'mdi-account-circle'"
      :color="props.color"
    />
  </v-avatar>
</template>
