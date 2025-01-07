<script setup lang="ts">
import { DIALOGS } from '@/components/common/dialogs/types';
import { useCardsService } from '@/services/useCardsService';

import { useDialogStore } from '@/stores/dialog';
import { useSnackbarStore } from '@/stores/snackbar';

import type { Card } from '@tillywork/shared';
import type { Slots } from 'vue';

const { card } = defineProps<{
  card: Card;
}>();

const menu = defineModel({
  default: false,
});

defineSlots<{
  activator(props: { props: Record<string, unknown> }): void;
}>();

const dialog = useDialogStore();
const { showSnackbar } = useSnackbarStore();

const { useDeleteCardMutation } = useCardsService();

const { copy } = useClipboard();

const { mutateAsync: deleteCard, isPending: isDeleting } =
  useDeleteCardMutation();

const cardActions = computed(() => {
  return [
    {
      title: 'Copy link',
      icon: 'mdi-link',
      onClick: copyLink,
    },
    {
      title: 'Delete',
      icon: 'mdi-delete-outline',
      onClick: confirmDelete,
    },
  ];
});

function confirmDelete() {
  dialog.openDialog({
    dialog: DIALOGS.CONFIRM,
    data: {
      message: `Are you sure you want to delete this ${
        card.type?.name.toLowerCase() ?? 'card'
      }?`,
      onConfirm: handleDeleteCard,
    },
  });
}

function handleDeleteCard() {
  if (!isDeleting.value) {
    deleteCard(card.id)
      .catch(() =>
        showSnackbar({
          message: `Something went wrong while deleting this ${
            card.type?.name.toLowerCase() ?? 'card'
          }`,
          color: 'error',
        })
      )
      .finally(() => {
        closeMenu();
        dialog.closeDialog(dialog.getDialogIndex(DIALOGS.CONFIRM));
      });
  }
}

function copyLink() {
  const fullUrl = `${window.location.origin}/card/${card.id}`;
  copy(fullUrl).then(() => {
    showSnackbar({
      message: `${
        card.type?.name ?? 'Card'
      } link was copied to your clipboard.`,
    });
    closeMenu();
  });
}

function closeMenu() {
  menu.value = false;
}
</script>

<template>
  <v-menu v-model="menu" :close-on-content-click="false" width="180">
    <template #activator="{ props }">
      <slot name="activator" :props>
        <!-- Default activator if none is provided -->
        <v-btn
          v-bind="props"
          class="text-caption me-2"
          density="comfortable"
          color="primary"
          variant="tonal"
        >
          <template #append>
            <v-icon icon="mdi-dots-vertical" />
          </template>
          Actions
        </v-btn>
      </slot>
    </template>
    <v-card>
      <v-list nav class="pa-1">
        <template v-for="action in cardActions" :key="action.icon">
          <v-list-item
            @click="action.onClick()"
            height="30"
            class="py-0"
            min-height="30"
          >
            <div class="d-flex align-center ga-2">
              <v-icon :icon="action.icon" />
              <v-list-item-title>{{ action.title }}</v-list-item-title>
            </div>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>
