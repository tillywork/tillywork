<script setup lang="ts">
import { NodeViewWrapper } from '@tiptap/vue-3';
import stringUtils from '@/utils/string';

const { node } = defineProps<{
  node: {
    attrs: {
      placeholderPath: string;
    };
  };
}>();

const chipLabel = computed(() => {
  return node.attrs.placeholderPath
    .replace('{{', '')
    .replace('}}', '')
    .split('.')
    .map((k) => stringUtils.objectKeyToDisplayFormat(k))
    .join(' ');
});
</script>

<template>
  <node-view-wrapper class="placeholder-chip">
    <v-chip
      size="small"
      color="primary"
      variant="tonal"
      class="text-caption"
      density="comfortable"
    >
      {{ chipLabel }}
    </v-chip>
  </node-view-wrapper>
</template>

<style scoped>
.placeholder-chip {
  display: inline-flex;
  vertical-align: middle;
  margin: 0 2px;
}
</style>
