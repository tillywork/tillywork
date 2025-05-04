<script setup lang="ts">
import { useNotificationPreferenceService } from '@/services/useNotificationPreferenceService';
import { useSnackbarStore } from '@/stores/snackbar';

import { NotificationChannel } from '@tillywork/shared';

const {
  channel,
  title,
  ripple = true,
} = defineProps<{
  channel: NotificationChannel;
  title: string;
  ripple?: boolean;
  hideSwitch?: boolean;
}>();

const { showSnackbar } = useSnackbarStore();

const { useGetNotificationPreference, useUpsertPreference } =
  useNotificationPreferenceService();

const { mutateAsync: upsertPreference, isPending: isUpserting } =
  useUpsertPreference();
const { data: preference } = useGetNotificationPreference({ channel });

const isEnabled = ref<boolean>(false);

const preferenceIcon = computed(() => {
  switch (channel) {
    case NotificationChannel.IN_APP:
      return 'mdi-bell';
    case NotificationChannel.SLACK:
      return 'mdi-slack';
  }
});

const enableSwitchLabel = computed(() => {
  if (preference.value?.enabled) {
    return 'Enabled';
  }

  return 'Disabled';
});

function handlePreferenceToggle(enabled: boolean) {
  upsertPreference({
    channel,
    enabled,
  }).catch(() => {
    showSnackbar({
      color: 'error',
      message: 'Something went wrong, please try again.',
    });
  });
}

watch(
  preference,
  (v) => {
    if (v) {
      isEnabled.value = v.enabled;
    }
  },
  { immediate: true, deep: true }
);

watch(isEnabled, (v) => {
  if (v !== preference.value?.enabled) {
    handlePreferenceToggle(v);
  }
});
</script>

<template>
  <v-list-item
    class="bg-accent-lighten px-4 mb-4"
    border="thin"
    height="64"
    rounded="md"
    :ripple
  >
    <v-list-item-title class="text-body-1 d-flex align-center">
      <v-icon class="me-2" :icon="preferenceIcon" size="18" />
      {{ title }}
    </v-list-item-title>
    <template #append>
      <v-switch
        v-if="!hideSwitch"
        v-model="isEnabled"
        hide-details
        :loading="isUpserting"
        v-tooltip="enableSwitchLabel"
        @click.stop
      />
    </template>
  </v-list-item>
</template>
