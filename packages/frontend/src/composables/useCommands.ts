import type { Command, CommandDto } from '@/components/common/commands/types';
import {
  DIALOGS,
  DIALOG_WIDTHS,
  SettingsTabs,
  UpsertDialogMode,
} from '@/components/common/dialogs/types';
import { useDialogStore } from '@/stores/dialog';
import { useStateStore } from '@/stores/state';
import { useThemeStore } from '@/stores/theme';
import { useCardTypesService } from './services/useCardTypesService';
import { useAuthStore } from '@/stores/auth';
import { leaderKey } from '@/utils/keyboard';

export const useCommands = () => {
  const keys = useMagicKeys();
  const dialog = useDialogStore();
  const { setIsCommandPaletteOpen } = dialog;
  const { isCommandPaletteOpen } = storeToRefs(dialog);
  const stateStore = useStateStore();
  const { setIsInputFocused } = stateStore;
  const { isInputFocused } = storeToRefs(stateStore);
  const themeStore = useThemeStore();
  const authStore = useAuthStore();
  const { isAuthenticated } = authStore;
  const { workspace } = storeToRefs(authStore);
  const cardTypesService = useCardTypesService();

  const isCommandsEnabled = computed(() => {
    return isAuthenticated() && !!workspace.value;
  });

  const workspaceId = computed(() => workspace.value?.id ?? 0);

  const { data: cardTypes } = cardTypesService.useFindAllQuery({
    workspaceId,
    enabled: isCommandsEnabled,
  });

  const cardTypeCommands = computed(() => {
    return (
      cardTypes.value?.map(
        (cardType) =>
          ({
            section: cardType.name,
            icon: 'mdi-card-plus-outline',
            title:
              'Create ' +
              cardType.name[0].toLocaleLowerCase() +
              cardType.name.slice(1),
            action: () =>
              dialog.openDialog({
                dialog: DIALOGS.CREATE_CARD,
                options: {
                  width: DIALOG_WIDTHS[DIALOGS.CREATE_CARD],
                },
                data: {
                  type: cardType,
                },
              }),
            shortcut:
              cardType.id === workspace.value?.defaultCardType.id
                ? ['N']
                : undefined,
          } as CommandDto)
      ) ?? []
    );
  });

  const watchers = ref(new Map());

  /**
   * Handles building the commands array.
   * @returns An array of commands
   */
  const commands = computed(() => {
    const commandsDtos: CommandDto[] = [
      // ~ Cards
      ...cardTypeCommands.value,

      // ~ Spaces
      {
        section: 'Space',
        icon: 'mdi-folder-plus-outline',
        title: 'Create space',
        action: () =>
          dialog.openDialog({
            dialog: DIALOGS.UPSERT_SPACE,
            options: {
              width: DIALOG_WIDTHS[DIALOGS.UPSERT_SPACE],
            },
            data: {
              mode: UpsertDialogMode.CREATE,
            },
          }),
        shortcut: ['S'],
      },

      // ~ Workspaces
      {
        section: 'Workspace',
        icon: 'mdi-briefcase-plus-outline',
        title: 'Create workspace',
        action: () =>
          dialog.openDialog({
            dialog: DIALOGS.CREATE_WORKSPACE,
            options: {
              fullscreen: true,
            },
          }),
        shortcut: ['W'],
      },
      {
        section: 'Workspace',
        icon: 'mdi-briefcase-edit',
        title: 'Update current workspace',
        action: () =>
          dialog.openDialog({
            dialog: DIALOGS.SETTINGS,
            options: {
              fullscreen: true,
            },
            data: {
              activeTab: SettingsTabs.WORKSPACE,
            },
          }),
        shortcut: ['F2'],
      },

      // Project
      {
        section: 'Project',
        icon: 'mdi-account-multiple',
        title: 'Invite and manage members',
        action: () =>
          dialog.openDialog({
            dialog: DIALOGS.SETTINGS,
            options: {
              fullscreen: true,
            },
            data: {
              activeTab: SettingsTabs.MEMBERS,
            },
          }),
      },

      // ~ Drawers
      {
        section: 'Drawer',
        icon: 'mdi-dock-right',
        title: 'Toggle information drawer',
        action: () => {
          stateStore.toggleInfoDrawer();
        },
        shortcut: [leaderKey, 'I'],
      },

      // ~ Settings
      {
        section: 'Settings',
        icon: 'mdi-cog',
        title: 'Settings',
        action: () =>
          dialog.openDialog({
            dialog: DIALOGS.SETTINGS,
            options: {
              fullscreen: true,
            },
          }),
        shortcut: [','],
      },
      {
        section: 'Settings',
        icon: 'mdi-monitor-screenshot',
        title: 'Theme',
        action: () =>
          dialog.openDialog({
            dialog: DIALOGS.SETTINGS,
            options: {
              fullscreen: true,
            },
            data: {
              activeTab: SettingsTabs.THEME,
            },
          }),
      },
      {
        section: 'Settings',
        icon: 'mdi-theme-light-dark',
        title: 'Toggle Dark Mode',
        action: () => themeStore.toggleTheme(),
      },
      {
        section: 'Settings',
        icon: 'mdi-toy-brick-outline',
        title: 'Card types',
        action: () =>
          dialog.openDialog({
            dialog: DIALOGS.SETTINGS,
            options: {
              fullscreen: true,
            },
            data: {
              activeTab: SettingsTabs.CARD_TYPES,
            },
          }),
      },
      {
        section: 'Settings',
        icon: 'mdi-form-select',
        title: 'Custom fields',
        action: () =>
          dialog.openDialog({
            dialog: DIALOGS.SETTINGS,
            options: {
              fullscreen: true,
            },
            data: {
              activeTab: SettingsTabs.FIELDS,
            },
          }),
      },
    ];

    // ~ Documentation
    if (import.meta.env.TW_VITE_DOCS_URL) {
      commandsDtos.push({
        section: 'Documentation',
        icon: 'mdi-text-box-outline',
        title: 'Documentation',
        action: () => window.open(import.meta.env.TW_VITE_DOCS_URL, '_blank'),
        shortcut: ['F1'],
      });
    }

    return commandsDtos.map((command, index) => {
      (command as Command).id = index;
      return command;
    }) as Command[];
  });

  /**
   * If the element is input, textarea, or has class
   * .ProseMirror, it is an input.
   * @param target the HTMLElement to check
   */
  function isTextInput(target: HTMLElement) {
    return (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.classList.contains('ProseMirror')
    );
  }

  /**
   * Listens app wide when an input is focused,
   * to disable command shortcuts when
   * user is typing.
   * @param event The focusin event
   */
  function handleInputFocus(event: Event) {
    if (isTextInput(event.target as HTMLElement)) {
      setIsInputFocused(true);
    }
  }

  /**
   * Listen app wide when an input is blurred,
   * to enable command shortcuts when
   * user finishes typing.
   * @param event The focusout event
   */
  function handleInputBlur(event: Event) {
    if (isTextInput(event.target as HTMLElement)) {
      setIsInputFocused(false);
    }
  }

  /**
   * Executes a command.
   * @param command The command to execute.
   */
  function executeCommand(command: Command) {
    command.action();
  }

  /**
   * Register listeners for given command
   * shortcuts.
   * @param commands The commands to listen to.
   */
  function registerCommandShortcutWatchers() {
    commands.value.forEach((command, index) => {
      if (!command.shortcut) {
        return;
      }

      const stop = watch(keys[command.shortcut.join('+')], (v) => {
        if (v && !isInputFocused.value) {
          executeCommand(command);
        }
      });

      watchers.value.set(index, stop);
    });
  }

  function clearCommandShortcutWatchers() {
    watchers.value.forEach((stop) => {
      stop();
    });
    watchers.value.clear();
  }

  function watchForCommandChanges() {
    // Re-register shortcut watchers when commands change
    watch(
      commands,
      (v) => {
        clearCommandShortcutWatchers();
        if (v) {
          registerCommandShortcutWatchers();
        }
      },
      { deep: true }
    );
  }

  function registerInputFocusAndBlurListeners() {
    // Listen to focus events to disable command shortcuts when user is typing
    onMounted(() => {
      window.addEventListener('focusin', handleInputFocus);
      window.addEventListener('focusout', handleInputBlur);
    });

    // Always clear listeners before unmount
    onBeforeUnmount(() => {
      window.removeEventListener('focusin', handleInputFocus);
      window.removeEventListener('focusout', handleInputBlur);
      clearCommandShortcutWatchers();
    });
  }

  return {
    keys,
    isInputFocused,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setIsInputFocused,
    registerCommandShortcutWatchers,
    executeCommand,
    commands,
    watchForCommandChanges,
    registerInputFocusAndBlurListeners,
    isCommandsEnabled,
  };
};
