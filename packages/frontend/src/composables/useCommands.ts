import type { Command, CommandDto } from '@/components/common/commands/types';
import {
  DIALOGS,
  DIALOG_WIDTHS,
  SettingsTabs,
} from '@/components/common/dialogs/types';
import { useDialogStore } from '@/stores/dialog';
import { useStateStore } from '@/stores/state';

export const useCommands = () => {
  const keys = useMagicKeys();
  const dialog = useDialogStore();
  const { setIsCommandPaletteOpen } = dialog;
  const { isCommandPaletteOpen } = storeToRefs(dialog);
  const stateStore = useStateStore();
  const { setIsInputFocused } = stateStore;
  const { isInputFocused } = storeToRefs(stateStore);
  const router = useRouter();

  /**
   * Handles building the commands array.
   * @returns An array of commands
   */
  function getCommands(): Command[] {
    const commands: CommandDto[] = [
      // ~ Cards
      {
        section: 'Card',
        icon: 'mdi-card-plus-outline',
        title: 'Create card',
        action: () =>
          dialog.openDialog({
            dialog: DIALOGS.CREATE_CARD,
            options: {
              width: DIALOG_WIDTHS[DIALOGS.CREATE_CARD],
            },
          }),
        shortcut: ['N'],
      },

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
              // ~ Upsertion
              mode: 'Create',
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
        icon: 'mdi-briefcase-outline',
        title: 'Workspace',
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
    ];

    // ~ Documentation
    if (import.meta.env.TW_VITE_DOCS_URL) {
      commands.push({
        section: 'Documentation',
        icon: 'mdi-text-box-outline',
        title: 'Documentation',
        action: () => window.open(import.meta.env.TW_VITE_DOCS_URL, '_blank'),
        shortcut: ['F1'],
      });
    }

    return commands.map((command, index) => {
      (command as Command).id = index;
      return command;
    }) as Command[];
  }

  /**
   * If the elemnt is input, textarea, or has class
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
  function registerCommandShortcutWatchers(commands: Command[]) {
    commands.forEach((command) => {
      if (!command.shortcut) {
        return;
      }

      // TODO: Support advanced sequences, E.g, `Cmd+C+C`
      watch(keys[command.shortcut.join('+')], (v) => {
        if (v && !isInputFocused.value) {
          executeCommand(command);
        }
      });
    });
  }

  return {
    keys,
    isInputFocused,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setIsInputFocused,
    registerCommandShortcutWatchers,
    handleInputBlur,
    handleInputFocus,
    executeCommand,
    getCommands,
  };
};
