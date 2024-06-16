<script setup lang="ts">
import { useCommands } from '@/composables/useCommands';
import stringUtils from '@/utils/string';

const {
  commands,
  registerCommandShortcutWatchers,
  executeCommand,
  setIsInputFocused,
  keys,
} = useCommands();
const { width: windowWidth, height: windowHeight } = useWindowSize();

const isOpen = ref(false);

const search = ref('');
const activeCommandIndex = ref<number>(-1);

const commandsCopy = computed(() =>
  commands.map((command, i) => ({
    ...command,
    id: i,
  }))
);

const searchedCommands = computed(() =>
  commandsCopy.value.filter(
    (command) =>
      stringUtils.fuzzySearch(search.value, command.title) ||
      (command.shortcut
        ? stringUtils.fuzzySearch(search.value, command.shortcut.join('+'))
        : false)
  )
);
/** Searched commands, grouped by section. */
const groupedSearchedCommands = computed(() =>
  searchedCommands.value.reduce((acc, command) => {
    const section = command.section;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(command);
    return acc;
  }, {} as Record<string, typeof commandsCopy.value>)
);

const activeCommand = computed(() =>
  activeCommandIndex.value !== -1
    ? searchedCommands.value[activeCommandIndex.value]
    : undefined
);

/**
 * The main key listener for the command palette.
 * Ctrl+K or Cmd+K.
 */
watch([keys['Cmd+K'], keys['Ctrl+K']], ([cmd, ctrl]) => {
  if (cmd || ctrl) {
    isOpen.value = !isOpen.value;
  }
});

// Reset the input focus when command palette is closed
watch(isOpen, (v) => {
  if (!v) {
    setIsInputFocused(false);
  }
});

onMounted(() => {
  registerCommandShortcutWatchers(commands);
});

/**
 * Handles keyboard events
 * when the command palette
 * is open.
 * @param e The keydown event
 */
function handleKeyDown(e: KeyboardEvent) {
  if (!isOpen.value) {
    return;
  }

  const commandsCount = searchedCommands.value.length;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (activeCommandIndex.value < commandsCount - 1) {
      activeCommandIndex.value++;
    } else {
      activeCommandIndex.value = 0;
    }
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (activeCommandIndex.value > 0) {
      activeCommandIndex.value--;
    } else {
      activeCommandIndex.value = commandsCount - 1;
    }
  }

  if (e.key === 'Enter' && activeCommand.value) {
    e.preventDefault();
    executeCommand(activeCommand.value);
  }
}

function handleAfterLeave() {
  search.value = '';
  activeCommandIndex.value = -1;
}

/**
 * Set up a global event listener to prevent the default action.
 * Only add commands that have browser specific events here
 * @param event the keydown event
 */
const onKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault();
  }
};

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <slot />
  <v-dialog
    v-model="isOpen"
    :scrim="false"
    @after-leave="handleAfterLeave"
    width="100%"
    max-width="600"
    location-strategy="connected"
    :target="[windowWidth / 2, windowHeight / 2.3]"
  >
    <v-card elevation="8">
      <!-- ~ Search Field -->
      <!-- TODO make clicking esc when search is focused clear the value, not close the dialog -->
      <v-text-field
        v-model="search"
        placeholder='Search for a command. E.g, "Create Card"'
        single-line
        hide-details
        variant="filled"
        density="default"
        autocomplete="off"
        autofocus
        class="flex-grow-0"
        @input="activeCommandIndex = 0"
      >
        <template #append-inner>
          <v-btn border variant="text" size="small">
            <span class="text-caption text-disabled">Esc</span>
          </v-btn>
        </template>
      </v-text-field>

      <!-- ~ Grouped List of Commands -->
      <v-list
        tabindex="-1"
        max-height="50vh"
        nav
        density="comfortable"
        :selected="[activeCommand?.id]"
        class="user-select-none"
      >
        <template v-if="!searchedCommands.length">
          <v-list-item>
            <v-list-item-title>
              The command you're looking for doesn't exist!
            </v-list-item-title>
            <v-list-item-subtitle>
              Maybe it's time to consider opening an issue on our
              <a href="https://github.com/tillywork/tillywork/issues"
                >GitHub!</a
              >
            </v-list-item-subtitle>
          </v-list-item>
        </template>

        <template v-else>
          <template
            v-for="(commands, section) in groupedSearchedCommands"
            :key="section"
          >
            <!-- ~ Section Marker -->
            <v-list-subheader>
              {{ section }}
            </v-list-subheader>

            <!-- ~ List of Commands -->
            <v-list-item
              v-for="(command, index) in commands"
              :key="index"
              :value="command.id"
              role="option"
              tabindex="-1"
              :lines="command.description ? 'two' : 'one'"
              @click="executeCommand(command)"
            >
              <!-- ~ Icon -->
              <template #prepend>
                <v-icon size="x-small" class="ps-3">
                  {{ command.icon }}
                </v-icon>
              </template>
              <!-- ~ Title -->
              <v-list-item-title>
                {{ command.title }}
              </v-list-item-title>
              <!-- ~ Description -->
              <v-list-item-subtitle v-if="command.description">
                {{ command.description }}
              </v-list-item-subtitle>
              <!-- ~ Shortcut Keys -->
              <template v-if="command.shortcut" #append>
                <v-code
                  v-for="key in command.shortcut"
                  :key="key"
                  tag="kbd"
                  class="mx-1 text-xs"
                >
                  {{ key }}
                </v-code>
              </template>
            </v-list-item>
            <v-divider />
          </template>
        </template>
      </v-list>
    </v-card>
  </v-dialog>
</template>
