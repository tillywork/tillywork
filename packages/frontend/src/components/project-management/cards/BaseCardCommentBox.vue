<script setup lang="ts">
import BaseEditorInput from '@/components/common/base/BaseEditor/BaseEditorInput.vue';
import { leaderKey } from '@/utils/keyboard';
import { type Content } from '@tiptap/vue-3';

const value = defineModel<Content>();
const isEmpty = defineModel<boolean>('empty');
const baseEditor = ref();

const { meta, ctrl, enter } = useMagicKeys();

defineProps<{
  placeholder?: string;
  //TODO add rules
}>();
const emit = defineEmits(['submit']);

function handleSubmit() {
  emit('submit', value.value);
}

function openBaseEditorFileDialog() {
  baseEditor.value.openFileDialog();
}

watch([meta, ctrl, enter], ([isMetaPressed, isCtrlPressed, isEnterPressed]) => {
  if (isEnterPressed && (isMetaPressed || isCtrlPressed)) {
    handleSubmit();
  }
});
</script>

<template>
  <v-card rounded="md" border="thin">
    <v-card-text>
      <base-editor-input
        ref="baseEditor"
        v-model:json="value"
        editable
        :placeholder
        v-model:empty="isEmpty"
      />
    </v-card-text>
    <v-card-actions class="align-start px-4">
      <base-icon-btn
        icon="mdi-paperclip"
        rounded="circle"
        @click="openBaseEditorFileDialog"
      />
      <v-spacer />
      <base-icon-btn
        icon="mdi-send-variant"
        color="surface-variant"
        variant="flat"
        rounded="circle"
        density="default"
        size="x-small"
        @click="handleSubmit"
        v-tooltip:bottom="leaderKey + ' + Enter'"
      />
    </v-card-actions>
  </v-card>
</template>
