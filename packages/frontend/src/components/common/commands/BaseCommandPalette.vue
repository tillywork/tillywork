<script setup lang="ts">
import { useDialogStore } from '@/stores/dialog';
import stringUtils from '@/utils/string';
import { DIALOG_WIDTHS } from '../dialogs/types';
import { type Command } from './types';

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

const props = defineProps<{
  commands: Command[];
}>();

const commands = computed(() =>
  props.commands.map((command, i) => ({
    ...command,
    id: i,
  }))
);

const isOpen = ref(false);
const keys = useMagicKeys();
watch([keys['Cmd+K'], keys['Ctrl+K']], ([cmd, ctrl]) => {
  if (cmd || ctrl) {
    isOpen.value = !isOpen.value;
  }
});

const search = ref('');
const searchedCommands = computed(() =>
  commands.value.filter((command) =>
    stringUtils.fuzzySearch(search.value, command.title)
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
  }, {} as Record<string, typeof commands.value>)
);

const activeIndex = ref(-1);
const activeCommandId = computed(() =>
  activeIndex.value !== -1
    ? searchedCommands.value[activeIndex.value].id
    : undefined
);
const activeCommand = computed(() =>
  activeCommandId.value !== undefined
    ? searchedCommands.value[activeCommandId.value]
    : undefined
);

const dialog = useDialogStore();

commands.value.forEach((command) => {
  if (!command.shortcut) {
    return;
  }

  // TODO: Support advanced sequences, E.g, `Cmd+C+C`
  watch(keys[command.shortcut.join('+')], (v) => {
    if (v) {
      executeCommand(command.id);
    }
  });
});

function handleKeyDown(e: KeyboardEvent) {
  const commandsCount = searchedCommands.value.length;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (activeIndex.value < commandsCount - 1) {
      activeIndex.value++;
    } else {
      activeIndex.value = 0;
    }
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (activeIndex.value > 0) {
      activeIndex.value--;
    } else {
      activeIndex.value = commandsCount - 1;
    }
  }

  if (e.key === 'Enter' && activeCommand.value) {
    e.preventDefault();
    executeCommand(activeCommand.value.id);
  }
}

function executeCommand(commandId: number) {
  const activeDialog = props.commands[commandId].dialog;
  if (activeDialog) {
    const dialogKind = activeDialog.kind;
    dialog.openDialog({
      dialog: dialogKind,
      data: activeDialog.data,
      options: {
        width: DIALOG_WIDTHS[dialogKind] ?? undefined,
        fullscreen: DIALOG_WIDTHS[dialogKind] ? undefined : true,
      },
    });
    isOpen.value = false;
  } else {
    // TODO: Support plain actions.
  }
}

function navigateToTillyworkGitHubIssues() {
  window.location.assign('https://github.com/tillywork/tillywork/issues');
}

function handleAfterLeave() {
  search.value = '';
  activeIndex.value = -1;
}
</script>

<template>
  <slot />
  <v-dialog
    v-model="isOpen"
    max-height="900"
    max-width="600"
    width="100%"
    @after-leave="handleAfterLeave"
  >
    <v-card>
      <!-- ~ Search Field -->
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
        @input="activeIndex = 0"
        @keydown="handleKeyDown"
      >
        <template #append-inner>
          <v-btn border variant="text" size="small">
            <span class="text-caption text-disabled">Esc</span>
          </v-btn>
        </template>
      </v-text-field>

      <!-- ~ Grouped List of Commands -->
      <v-card-text class="pa-0">
        <v-list nav density="comfortable" class="user-select-none">
          <template v-if="!searchedCommands.length">
            <v-list-item>
              <v-list-item-title>
                The command you're looking for doesn't exist!
              </v-list-item-title>
              <v-list-item-subtitle>
                Maybe it's time to consider opening an issue on our
                <span class="link" @click="navigateToTillyworkGitHubIssues"
                  >GitHub!</span
                >
              </v-list-item-subtitle>
            </v-list-item>
          </template>

          <template
            v-else
            v-for="(commands, section) in groupedSearchedCommands"
            :key="section"
          >
            <!-- ~ Section Marker -->
            <v-list-subheader>
              {{ section }}
            </v-list-subheader>

            <!-- ~ List of Commands -->
            <v-list-item
              v-for="command in commands"
              :key="command.id"
              :active="command.id === activeCommandId"
              role="option"
              :lines="command.description ? 'two' : 'one'"
              @click="executeCommand(command.id)"
            >
              <!-- ~ Icon -->
              <template #prepend>
                <v-icon> {{ command.icon }} </v-icon>
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
                  class="mx-1"
                >
                  {{ key }}
                </v-code>
              </template>
            </v-list-item>
          </template>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
