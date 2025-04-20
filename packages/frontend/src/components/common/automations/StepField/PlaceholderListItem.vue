<script setup lang="ts">
import stringUtils from '@/utils/string';

const {
  itemValue,
  placeholderPath,
  parentPath = '',
} = defineProps<{
  itemValue: any;
  placeholderPath: string | number;
  parentPath?: string;
}>();

const emit = defineEmits(['select']);

function handleSelectPlaceholder(placeholderPath: string | number) {
  let fullPath;

  if (Number.isInteger(placeholderPath)) {
    fullPath = parentPath
      ? `${parentPath}[${placeholderPath}]`
      : placeholderPath.toString();
  } else {
    fullPath = parentPath
      ? `${parentPath}.${placeholderPath}`
      : placeholderPath.toString();
  }

  emit('select', fullPath);
}
</script>

<template>
  <v-list-item
    @click="handleSelectPlaceholder(placeholderPath)"
    height="35"
    min-height="35"
  >
    <v-list-item-title class="user-select-none">
      <span>
        {{ stringUtils.objectKeyToDisplayFormat(placeholderPath.toString()) }}:
      </span>
      <span class="text-primary">
        {{ itemValue }}
      </span>
    </v-list-item-title>
  </v-list-item>
</template>
