<script setup lang="ts">
import BaseEditorInput from '@/components/common/base/BaseEditor/BaseEditorInput.vue';
import { leaderKey } from '@/utils/keyboard';
import { ActivityType, type ActivityTypeOption } from '@tillywork/shared';
import { type Content } from '@tiptap/vue-3';

const value = defineModel<Content>();
const isEmpty = defineModel<boolean>('empty');

const baseEditor = ref();
const activityType = ref<ActivityType>(ActivityType.COMMENT);
const activityTypes: ActivityTypeOption[] = [
  {
    name: 'Comment',
    type: ActivityType.COMMENT,
    icon: 'mdi-comment-account',
  },
  {
    name: 'Task',
    type: ActivityType.TASK,
    icon: 'mdi-calendar-check',
  },
  {
    name: 'Email',
    type: ActivityType.EMAIL,
    icon: 'mdi-email',
  },
  {
    name: 'Call',
    type: ActivityType.CALL,
    icon: 'mdi-phone',
  },
  {
    name: 'Message',
    type: ActivityType.MESSAGE,
    icon: 'mdi-message',
  },
  {
    name: 'Meeting',
    type: ActivityType.MEETING,
    icon: 'mdi-laptop-account',
  },
];

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
    <v-card-item>
      <v-chip-group v-model="activityType" color="primary" mandatory>
        <template
          v-for="activityType in activityTypes"
          :key="activityType.type"
        >
          <v-chip density="comfortable" :value="activityType.type">
            <template #prepend>
              <v-icon :icon="activityType.icon" class="me-2" />
            </template>
            <span class="text-caption">
              {{ activityType.name }}
            </span>
          </v-chip>
        </template>
      </v-chip-group>
    </v-card-item>
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
