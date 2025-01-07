<script setup lang="ts">
import BaseEditorInput from '@/components/common/base/BaseEditor/BaseEditorInput.vue';
import { useBaseEditor } from '@/composables/useBaseEditor';
import { leaderKey } from '@/utils/keyboard';
import { type Content } from '@tiptap/vue-3';
import type { Slots } from 'vue';

const value = defineModel<Content>();
const htmlValue = defineModel<string>('html');
const isEmpty = defineModel<boolean>('empty');
const baseEditor = ref();

const slots = useSlots() as Slots & {
  append?: (props: { props: any }) => VNode[];
  appendActions?: (props: { props: any }) => VNode[];
};
const { openBaseEditorFileDialog } = useBaseEditor({
  baseEditor,
  onSubmit: () => handleSubmit(),
});

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
  <v-card border="thin" class="pa-4">
    <base-editor-input
      ref="baseEditor"
      v-model:json="value"
      v-model:html="htmlValue"
      editable
      :placeholder
      v-model:empty="isEmpty"
    />
    <template v-if="slots['append']">
      <slot name="append" />
    </template>
    <div class="d-flex align-start mt-4 ga-2">
      <base-icon-btn
        icon="mdi-paperclip"
        rounded="circle"
        @click="openBaseEditorFileDialog"
      />
      <template v-if="slots['appendActions']">
        <slot name="appendActions" />
      </template>
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
    </div>
  </v-card>
</template>
