<script setup lang="ts">
import BaseEditorInput from '@/components/common/base/BaseEditor/BaseEditorInput.vue';
import { type Content } from '@tiptap/vue-3';

const value = defineModel<Content>();
const isEmpty = defineModel<boolean>('empty');

defineProps<{
  placeholder?: string;
  //TODO add rules
}>();
const emit = defineEmits(['submit']);

function handleSubmit() {
  emit('submit', value.value);
}
</script>

<template>
  <v-card rounded="md" border="thin" class="mt-6">
    <v-card-text>
      <base-editor-input
        v-model:json="value"
        editable
        :placeholder
        v-model:empty="isEmpty"
      />
    </v-card-text>
    <v-card-actions class="justify-end px-4">
      <base-icon-btn
        icon="mdi-send-variant"
        color="surface-variant"
        variant="flat"
        rounded="circle"
        density="default"
        size="x-small"
        @click="handleSubmit"
      />
    </v-card-actions>
  </v-card>
</template>
