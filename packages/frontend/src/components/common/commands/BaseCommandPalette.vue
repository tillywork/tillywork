<script setup lang="ts">
import type { VList } from 'vuetify/components';
import type { Command } from './types';

import { useCommandStore } from '@/stores/command';

import { useStateStore } from '@/stores/state';
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts';

import BaseCardChip from '@/components/common/cards/BaseCardChip.vue';
import PaletteField from './PaletteField/PaletteField.vue';

import posthog from 'posthog-js';
import { useListKeyboardNavigation } from '@/composables/useListKeyboardNavigation';

const {
  commands,
  isOpen,
  currentField,
  searchIcon,
  searchPlaceholder,
  search,
} = storeToRefs(useCommandStore());
const { isInputFocused, currentCard } = storeToRefs(useStateStore());

const isFieldMode = computed(() => !!currentField.value);

const { activeIndex, containerRef } = useListKeyboardNavigation({
  enabled: computed(() => isOpen.value && !isFieldMode.value),
});
const { currentKeyCombo } = useKeyboardShortcuts();

const filteredCommands = computed(() => {
  const searchTerm = search.value.toLowerCase();
  if (!searchTerm) return commands.value;

  return commands.value.filter((command) => {
    const matchTitle = command.title.toLowerCase().includes(searchTerm);
    const matchShortcut = command.shortcut
      ?.join('+')
      .toLowerCase()
      .includes(searchTerm);
    const matchSection = command.section.toLowerCase().includes(searchTerm);
    return matchTitle || matchShortcut || matchSection;
  });
});

const groupedCommands = computed(() => {
  return filteredCommands.value.reduce((groups, command) => {
    const section = command.section;
    if (!groups[section]) {
      groups[section] = [];
    }
    groups[section].push(command);
    return groups;
  }, {} as Record<string, Command[]>);
});

const activeCommand = computed(() => filteredCommands.value[activeIndex.value]);

function handleKeyDown(e: KeyboardEvent) {
  if (!isOpen.value) {
    handleShortcut(e);
    return;
  }

  switch (e.key) {
    case 'Enter':
      e.preventDefault();
      if (activeCommand.value) {
        executeCommand(activeCommand.value);
      }
      break;
    case 'Escape':
      e.stopImmediatePropagation();
      if (search.value) {
        search.value = '';
      } else if (isFieldMode.value) {
        exitFieldMode();
      } else {
        closeCommandPalette();
      }
      break;
    case 'Backspace':
      if (isFieldMode.value && !search.value) {
        e.preventDefault();
        exitFieldMode();
      }
      break;

    default:
      handleShortcut(e);
  }
}

function executeCommand(command: Command, viaShortcut: boolean = false) {
  command.action(command);
  posthog.capture('Command Executed', { command: command.id, viaShortcut });

  if (!command.keepPaletteOpen) {
    closeCommandPalette();
  }
}

function exitFieldMode() {
  currentField.value = null;
  search.value = '';
  searchIcon.value = null;
  searchPlaceholder.value = null;
  activeIndex.value = 0;
}

function closeCommandPalette() {
  isOpen.value = false;
}

function handleAfterLeave() {
  search.value = '';
  activeIndex.value = 0;
}

function handleShortcut(event: KeyboardEvent) {
  if (isInputFocused.value) return;

  const command = commands.value.find(
    (c) =>
      c.shortcut && c.shortcut.join('+').toUpperCase() === currentKeyCombo.value
  );

  if (command) {
    event.preventDefault();
    executeCommand(command, true);
  }
}

const handleInputFocus = (event: Event) => {
  const target = event.target as HTMLElement;
  if (isTextInput(target)) {
    isInputFocused.value = true;
  }
};

const handleInputBlur = (event: Event) => {
  const target = event.target as HTMLElement;
  if (isTextInput(target)) {
    isInputFocused.value = false;
  }
};

function isTextInput(target: HTMLElement) {
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.classList.contains('ProseMirror')
  );
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('focusin', handleInputFocus);
  window.addEventListener('focusout', handleInputBlur);

  // Register command to open command palette
  const handleShortcut = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      isOpen.value = true;
    }
  };

  window.addEventListener('keydown', handleShortcut);
  onBeforeUnmount(() => window.removeEventListener('keydown', handleShortcut));
});

onBeforeUnmount(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.removeEventListener('focusin', handleInputFocus);
  window.removeEventListener('focusout', handleInputBlur);
});

watch(isOpen, (v) => {
  if (!v) {
    isInputFocused.value = false;
    currentField.value = null;
  } else {
    posthog.capture('Command Palette Opened');
  }
});
</script>

<template>
  <v-dialog
    v-model="isOpen"
    :scrim="false"
    @after-leave="handleAfterLeave"
    width="100%"
    max-width="600"
    content-class="command-palette-dialog"
  >
    <v-card class="command-palette" elevation="12" color="dialog" border="thin">
      <div class="px-4 pb-2 border-b-thin">
        <div v-if="currentCard" class="pt-4">
          <base-card-chip
            :card="currentCard"
            width="fit-content"
            disable-link
          />
        </div>
        <v-text-field
          v-model="search"
          :placeholder="searchPlaceholder ?? 'Type a command or search...'"
          single-line
          hide-details
          variant="plain"
          rounded="0"
          density="default"
          autocomplete="off"
          autofocus
          @input="activeIndex = 0"
          :prepend-inner-icon="searchIcon ?? 'mdi-magnify'"
        >
          <template #append-inner v-if="search">
            <v-kbd class="text-caption elevation-0 font-weight-medium"
              >Esc</v-kbd
            >
          </template>
        </v-text-field>
      </div>

      <v-list
        ref="containerRef"
        tabindex="-1"
        max-height="400"
        nav
        density="compact"
        bg-color="transparent"
        :selected="[activeCommand?.id]"
      >
        <template v-if="!isFieldMode">
          <template v-if="!filteredCommands.length">
            <v-list-item>
              <template #prepend>
                <v-icon size="x-small" color="warning">
                  mdi-alert-circle-outline
                </v-icon>
              </template>
              <v-list-item-title>
                No matching commands found
              </v-list-item-title>
              <v-list-item-subtitle>
                Try a different search term
              </v-list-item-subtitle>
            </v-list-item>
          </template>

          <template v-else>
            <template
              v-for="(commands, section) in groupedCommands"
              :key="section"
            >
              <v-list-subheader class="text-caption" v-if="section">
                {{ section }}
              </v-list-subheader>

              <v-list-item
                v-for="command in commands"
                :key="command.id"
                :value="command.id"
                :active="command === activeCommand"
                :lines="command.description ? 'two' : 'one'"
                @click="executeCommand(command)"
                class="px-3"
                :class="{
                  'opacity-70': command !== activeCommand,
                }"
                rounded="pill"
                tabindex="-1"
              >
                <template #prepend>
                  <v-icon :icon="command.icon" size="x-small" />
                </template>

                <v-list-item-title class="font-weight-regular">
                  {{ command.title }}
                </v-list-item-title>

                <v-list-item-subtitle v-if="command.description">
                  {{ command.description }}
                </v-list-item-subtitle>

                <template v-if="command.shortcut" #append>
                  <div class="d-flex align-center ga-1 pe-2">
                    <template
                      v-for="(key, index) in command.shortcut"
                      :key="index"
                    >
                      <v-kbd class="text-xs elevation-0 font-weight-medium">
                        {{ key }}
                      </v-kbd>
                    </template>
                  </div>
                </template>
              </v-list-item>

              <v-divider />
            </template>
          </template>
        </template>

        <template v-else>
          <palette-field />
        </template>
      </v-list>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
:deep(.command-palette-dialog) {
  position: fixed !important;
  top: 80px !important;
  margin-top: 0 !important;
}
</style>

<style lang="scss">
.command-palette {
  .v-field--variant-plain {
    .v-field__prepend-inner {
      align-items: center !important;
    }
  }
}
</style>
