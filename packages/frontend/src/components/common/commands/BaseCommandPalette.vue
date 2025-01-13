<script setup lang="ts">
import type { VList } from 'vuetify/components';
import type { Command } from './types';

import { useCommandStore } from '@/stores/command';

import { useStateStore } from '@/stores/state';
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts';

import BaseCardChip from '@/components/project-management/cards/BaseCardChip.vue';

const search = ref('');
const activeIndex = ref(0);
const listRef = ref<VList>();

const { commands, isOpen } = storeToRefs(useCommandStore());
const { isInputFocused, currentCard } = storeToRefs(useStateStore());

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
    case 'ArrowDown':
      e.preventDefault();
      navigateList('down');
      break;
    case 'ArrowUp':
      e.preventDefault();
      navigateList('up');
      break;
    case 'Enter':
      e.preventDefault();
      if (activeCommand.value) {
        executeCommand(activeCommand.value);
      }
      break;
    case 'Escape':
      if (search.value) {
        e.stopImmediatePropagation();
        search.value = '';
      } else {
        closeCommandPalette();
      }
      break;
    default:
      handleShortcut(e);
  }
}

function navigateList(direction: 'up' | 'down') {
  const totalCommands = filteredCommands.value.length;
  if (totalCommands === 0) return;

  if (direction === 'down') {
    activeIndex.value = (activeIndex.value + 1) % totalCommands;
  } else {
    activeIndex.value = (activeIndex.value - 1 + totalCommands) % totalCommands;
  }

  nextTick(() => {
    ensureActiveCommandVisible();
  });
}

function ensureActiveCommandVisible() {
  const list = listRef.value?.$el;
  const activeItem = list?.querySelector('.v-list-item--active');

  if (activeItem) {
    activeItem.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }
}

function executeCommand(command: Command) {
  command.action();
  closeCommandPalette();
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
    if (command.condition && !command.condition()) {
      return;
    }

    event.preventDefault();
    command.action();
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
  >
    <v-card elevation="8">
      <v-text-field
        v-model="search"
        placeholder="Type a command or search..."
        single-line
        hide-details
        variant="filled"
        rounded="0"
        density="default"
        autocomplete="off"
        autofocus
        @input="activeIndex = 0"
        :prepend-inner-icon="!currentCard ? 'mdi-magnify' : undefined"
      >
        <template #prepend-inner v-if="currentCard" class="pa-2">
          <base-card-chip :card="currentCard" />
        </template>
        <template #append-inner v-if="search">
          <v-kbd class="text-caption">Esc</v-kbd>
        </template>
      </v-text-field>

      <v-list
        ref="listRef"
        tabindex="-1"
        max-height="50vh"
        nav
        density="compact"
        :selected="[activeCommand?.id]"
      >
        <template v-if="!filteredCommands.length">
          <v-list-item>
            <template #prepend>
              <v-icon size="x-small" color="warning">
                mdi-alert-circle-outline
              </v-icon>
            </template>
            <v-list-item-title> No matching commands found </v-list-item-title>
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
              tabindex="-1"
            >
              <template #prepend>
                <v-icon :icon="command.icon" size="x-small" />
              </template>

              <v-list-item-title>
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
                    <v-kbd class="text-xs elevation-0 bg-accent">
                      {{ key }}
                    </v-kbd>
                  </template>
                </div>
              </template>
            </v-list-item>

            <v-divider />
          </template>
        </template>
      </v-list>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.v-list {
  .v-list-item {
    scroll-margin-top: 8px;
    scroll-margin-bottom: 8px;
  }
}
</style>
