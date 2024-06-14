<script setup lang="ts">
import { useDialogStore } from '@/stores/dialog';
import { VCommandPalette, createCommand } from 'v-command-palette';
import { DIALOGS, DIALOG_WIDTHS } from '../dialogs/types';

const dialog = useDialogStore();

const commands = [
  // ~ Cards
  createCommand({
    title: 'Create Card',
    icon: 'mdi-plus',
    command() {
      dialog.openDialog({
        dialog: DIALOGS.CREATE_CARD,
        options: {
          width: DIALOG_WIDTHS[DIALOGS.CREATE_CARD],
        },
      });
    },
    section: 'Card',
  }),
  createCommand({
    title: 'Create Card Type',
    icon: 'mdi-plus',
    command() {
      dialog.openDialog({
        dialog: DIALOGS.CREATE_CARD_TYPE,
        options: {
          width: DIALOG_WIDTHS[DIALOGS.CREATE_CARD_TYPE],
        },
      });
    },
    section: 'Card',
  }),

  // ~ Spaces
  createCommand({
    title: 'Create Space',
    icon: 'mdi-plus',
    command() {
      dialog.openDialog({
        dialog: DIALOGS.CREATE_SPACE,
        options: {
          width: DIALOG_WIDTHS[DIALOGS.CREATE_SPACE],
        },
      });
    },
    section: 'Space',
  }),

  // ~ Workspaces
  createCommand({
    title: 'Create Workspace',
    icon: 'mdi-plus',
    command() {
      dialog.openDialog({
        dialog: DIALOGS.CREATE_CARD,
        options: {
          width: DIALOG_WIDTHS[DIALOGS.CREATE_CARD],
        },
      });
    },
    section: 'Workspace',
  }),

  // ~ Settings
  createCommand({
    title: 'Open Settings',
    icon: 'mdi-cog',
    command() {
      dialog.openDialog({
        dialog: DIALOGS.SETTINGS,
        options: {
          fullscreen: true,
        },
      });
    },
    section: 'Settings',
  }),
];

/**
 * Set up a global event listener to prevent the default action.
 * Only add commands that have browser specific events here
 * @param event
 */
const onKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault();
  }
};
onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <v-command-palette :commands="commands">
    <slot />
  </v-command-palette>
</template>
