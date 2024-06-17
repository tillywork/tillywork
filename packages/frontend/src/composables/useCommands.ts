import type { Command } from '@/components/common/commands/types';
import { DIALOGS, DIALOG_WIDTHS } from '@/components/common/dialogs/types';
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

  const commands: Command[] = [
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
          dialog: DIALOGS.CREATE_SPACE,
          options: {
            width: DIALOG_WIDTHS[DIALOGS.CREATE_SPACE],
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
            activeTab: 'theme',
          },
        }),
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
            activeTab: 'cardTypes',
          },
        }),
    },
  ];

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
    commands,
    keys,
    isInputFocused,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setIsInputFocused,
    registerCommandShortcutWatchers,
    handleInputBlur,
    handleInputFocus,
    executeCommand,
  };
};
