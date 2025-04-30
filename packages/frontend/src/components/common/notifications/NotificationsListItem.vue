<script setup lang="ts">
import { useFields } from '@/composables/useFields';
import { useCardsService } from '@/services/useCardsService';

import { dayjs, NotificationType, type Notification } from '@tillywork/shared';

const { notification } = defineProps<{
  notification: Notification;
}>();

const emit = defineEmits(['click']);

const { useGetCardQuery } = useCardsService();
const { data: relatedCard } = useGetCardQuery({
  cardId: computed(() => Number(notification.relatedResourceId)),
  enabled: computed(() => notification.relatedResourceType === 'card'),
});

const { titleField } = useFields({
  cardTypeId: computed(() => Number(relatedCard.value?.type.id)),
  enabled: computed(() => !!relatedCard.value),
});

const notificationTitle = computed(() => {
  if (notification.relatedResourceType === 'card') {
    if (titleField.value) {
      return relatedCard.value?.data[titleField.value.slug] ?? 'Card';
    }
  }
});

const notificationIcon = computed(() => {
  switch (notification.type) {
    case NotificationType.ASSIGNED:
      return 'mdi-account-plus';
    case NotificationType.UNASSIGNED:
      return 'mdi-account-minus';
    case NotificationType.COMMENT:
      return 'mdi-comment';
    case NotificationType.STAGE_UPDATED:
      return 'mdi-circle-slice-8';
    case NotificationType.MENTION:
      return 'mdi-at';
    default:
      return 'mdi-bell';
  }
});

function handleNotificationClick() {
  emit('click', {
    notification,
    card: relatedCard.value,
  });
}
</script>

<template>
  <v-list-item @click="handleNotificationClick">
    <template #prepend>
      <v-sheet
        rounded="circle"
        color="accent"
        width="36"
        height="36"
        class="d-flex align-center justify-center me-3"
        border="thin"
      >
        <v-icon :icon="notificationIcon" :color="notification.color" />
      </v-sheet>
    </template>
    <v-list-item-title class="d-flex align-center ga-2">
      <template v-if="!notification.isRead">
        <v-icon icon="mdi-circle" size="8" color="info" />
      </template>
      {{ notificationTitle }}
    </v-list-item-title>
    <v-list-item-subtitle class="d-flex align-center">
      {{ notification.message }}
      <v-spacer />
      {{ dayjs(notification.createdAt).formatShort() }}
    </v-list-item-subtitle>
  </v-list-item>
</template>
