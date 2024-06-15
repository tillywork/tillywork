<script setup lang="ts">
import { DIALOGS } from '../dialogs/types';
import BaseCommandPalette from './BaseCommandPalette.vue';
import type { Command } from './types';

const commands: Command[] = [
  // ~ Cards
  {
    section: 'Card',
    icon: 'mdi-card-plus-outline',
    title: 'Create Card',
    dialog: {
      kind: DIALOGS.CREATE_CARD,
    },
  },
  {
    section: 'Card',
    icon: 'mdi-toy-brick-plus-outline',
    title: 'Create Card Type',
    dialog: {
      kind: DIALOGS.CREATE_CARD_TYPE,
    },
  },

  // ~ Spaces
  {
    section: 'Space',
    icon: 'mdi-folder-plus-outline',
    title: 'Create Space',
    dialog: {
      kind: DIALOGS.CREATE_SPACE,
    },
  },

  // ~ Workspaces
  {
    section: 'Workspace',
    icon: 'mdi-briefcase-plus-outline',
    title: 'Create Workspace',
    dialog: {
      kind: DIALOGS.CREATE_WORKSPACE,
    },
  },

  // ~ Settings
  {
    section: 'Settings',
    icon: 'mdi-cog',
    title: 'Open Settings',
    dialog: {
      kind: DIALOGS.SETTINGS,
    },
  },
  {
    section: 'Settings',
    icon: 'mdi-monitor-screenshot',
    title: 'Open Settings: Theme',
    dialog: {
      kind: DIALOGS.SETTINGS,
      data: {
        activeTab: 'theme',
      },
    },
  },
  {
    section: 'Settings',
    icon: 'mdi-toy-brick-outline',
    title: 'Open Settings: Card Types',
    dialog: {
      kind: DIALOGS.SETTINGS,
      data: {
        activeTab: 'cardTypes',
      },
    },
  },
];
</script>

<template>
  <base-command-palette :commands="commands">
    <slot />
  </base-command-palette>
</template>
