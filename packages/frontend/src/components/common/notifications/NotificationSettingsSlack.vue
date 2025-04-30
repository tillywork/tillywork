<script setup lang="ts">
import { useSlackService } from '@/services/useSlackService';
import { useNotificationPreferenceService } from '@/services/useNotificationPreferenceService';
import { NotificationChannel, type PreferenceConfig } from '@tillywork/shared';

import MenuWrapper from '../base/ContextMenu/MenuWrapper.vue';

import _ from 'lodash';
import type { ContextMenuItem } from '../base/ContextMenu/types';

const { useGetNotificationPreference, useUpsertPreference } =
  useNotificationPreferenceService();
const { useGetChannels } = useSlackService();

const { data: preference } = useGetNotificationPreference({
  channel: NotificationChannel.SLACK,
});
const { mutateAsync: upsertPreference } = useUpsertPreference();

const { data: slackChannels, isFetching: isLoadingChannels } = useGetChannels();

const config = ref<PreferenceConfig>({});

const selectedChannel = computed(() => {
  return slackChannels.value?.find(
    (channel) => channel.id === config.value.channelId
  );
});

const slackChannelOptions = computed(() => {
  const channels: ContextMenuItem[] =
    slackChannels.value?.map((channel) => ({
      title: `#${channel.name}`,
      value: channel.id,
    })) ?? [];

  const emptyOption: ContextMenuItem = {
    title: 'None',
    action: () =>
      (config.value = {
        isDmEnabled: config.value.isDmEnabled,
        channelId: undefined,
      }),
  };

  return [emptyOption, ...channels];
});

watch(
  preference,
  (v) => {
    if (v) {
      config.value = _.cloneDeep(v.config);
    }
  },
  { immediate: true }
);

watch(
  config,
  (newConfig) => {
    if (!_.isEqual(newConfig, preference.value?.config)) {
      save();
    }
  },
  { deep: true }
);

async function save() {
  await upsertPreference({
    channel: NotificationChannel.SLACK,
    enabled: config.value.isDmEnabled || !!config.value.channelId,
    config: config.value,
  });
}
</script>

<template>
  <v-card>
    <v-card>
      <h3>Slack</h3>

      <p class="text-subtitle-2 mb-2 text-color-subtitle">
        Configure how you want to receive notifications on Slack.
      </p>

      <v-divider class="my-6" />

      <v-list>
        <v-list-item
          class="bg-accent-lighten mb-4 px-6"
          border="thin"
          rounded="md"
          height="64"
        >
          <v-list-item-title class="text-body-3 font-weight-bold">
            Personal notifications
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            Receive your notifications directly
          </v-list-item-subtitle>

          <template #append>
            <v-switch v-model="config.isDmEnabled" hide-details />
          </template>
        </v-list-item>

        <v-list-item
          class="bg-accent-lighten mb-4 px-6"
          border="thin"
          rounded="md"
          height="64"
        >
          <v-list-item-title class="text-body-3 font-weight-bold">
            Team notifications
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            Send team notifications to a specific channel
          </v-list-item-subtitle>

          <template #append>
            <v-menu>
              <template #activator="{ props }">
                <v-chip
                  v-bind="props"
                  class="text-caption d-flex justify-center"
                  rounded="md"
                  :color="selectedChannel ? 'teal-darken-2' : 'default'"
                  variant="tonal"
                  :style="{
                    minWidth: '60px',
                  }"
                >
                  <template v-if="isLoadingChannels">
                    <v-progress-circular
                      indeterminate
                      width="2"
                      color="primary"
                      size="16"
                    />
                  </template>
                  <template v-else-if="selectedChannel">
                    #{{ selectedChannel?.name }}
                  </template>
                  <template v-else>
                    <i>Disabled</i>
                  </template>
                </v-chip>
              </template>
              <menu-wrapper
                v-model="config.channelId"
                :items="slackChannelOptions"
                selectable
              />
            </v-menu>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-card>
</template>
