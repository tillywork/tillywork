<script setup lang="ts">
import { type Card, type Notification } from '@tillywork/shared';

import { useNotificationStore } from '@/stores/notification';
import { useNotificationService } from '@/services/useNotificationService';

import NotificationsListItem from './NotificationsListItem.vue';
import BaseCard from '../cards/BaseCard/BaseCard.vue';

const { notifications } = storeToRefs(useNotificationStore());

const activeCard = ref<Card | null>(null);
const activeNotification = ref<Notification | null>(null);

const { useUpdateNotification } = useNotificationService();
const { mutateAsync: updateNotification } = useUpdateNotification();

function handleClickNotification({
  notification,
  card,
}: {
  notification: Notification;
  card: Card;
}) {
  activeCard.value = card;
  activeNotification.value = notification;

  if (!notification.isRead) {
    updateNotification({
      id: notification.id,
      isRead: true,
    });
  }
}

function handleClose() {
  activeCard.value = null;
  activeNotification.value = null;
}

function isNotificationActive(notification: Notification) {
  return activeNotification.value?.id === notification.id;
}
</script>

<template>
  <v-container fluid class="h-100" max-height="100vh">
    <v-row class="h-100 border-thin rounded-md overflow-hidden" no-gutters>
      <v-col cols="12" md="4" class="h-100">
        <v-card
          class="border-e-thin d-flex flex-column"
          rounded="0"
          height="100%"
        >
          <v-card-text class="border-b-thin py-2 flex-grow-0">
            <span class="text-body-3">Inbox</span>
          </v-card-text>
          <v-list lines="two" nav>
            <template v-if="notifications?.length">
              <template
                v-for="notification in notifications"
                :key="notification.id"
              >
                <NotificationsListItem
                  :notification
                  :active="isNotificationActive(notification)"
                  @click="handleClickNotification"
                />
              </template>
            </template>
            <template v-else>
              <v-list-item>
                <template #prepend>
                  <v-sheet
                    rounded="circle"
                    color="accent"
                    width="36"
                    height="36"
                    class="d-flex align-center justify-center me-3"
                    border="thin"
                  >
                    <v-icon icon="mdi-inbox-outline" />
                  </v-sheet>
                </template>
                <v-list-item-subtitle>
                  No notifications found.
                </v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="8">
        <template v-if="activeCard">
          <base-card
            :card="activeCard"
            hide-back-button
            temporary-drawer
            closable
            @close="handleClose"
          />
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>
