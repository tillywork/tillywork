<script setup lang="ts">
import BaseEditorInput from '@/components/common/base/BaseEditor/BaseEditorInput.vue';
import BaseIconBtn from '@/components/common/base/BaseIconBtn.vue';
import { type Content } from '@tiptap/vue-3';

const value = defineModel<Content>();
defineProps<{
  placeholder?: string;
}>();
const emit = defineEmits(['submit']);

function handleSubmit() {
  console.log('submit', value.value);
  emit('submit', value.value);
}
</script>

<template>
  <v-card rounded="md" border="thin" class="mt-6">
    <v-card-text>
      <base-editor-input v-model:json="value" editable :placeholder />
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
