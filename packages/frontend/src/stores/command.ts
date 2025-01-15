import {
  DIALOG_WIDTHS,
  DIALOGS,
  UpsertDialogMode,
} from '@/components/common/dialogs/types';
import { SETTINGS } from '@/components/common/settings/types';
import { useDialogStore } from './dialog';
import { useThemeStore } from './theme';
import { type Command } from '@/components/common/commands/types';
import { useAuthStore } from './auth';
import { lowerFirst } from 'lodash';
import { useStateStore } from './state';
import { WorkspaceTypes, type Card, type Field } from '@tillywork/shared';
import { leaderKey } from '@/utils/keys';
import { useCard } from '@/composables/useCard';
import { useFields } from '@/composables/useFields';

export const useCommandStore = defineStore('command', () => {
  const isOpen = ref(false);
  const currentList = computed(() => getCurrentList());
  const currentListId = computed(() => currentList.value?.id);
  const cardTypeId = computed(() => currentCard.value?.type.id);
  const fieldsEnabled = computed(
    () => !!currentList.value && !!cardTypeId.value
  );

  const dialogStore = useDialogStore();
  const themeStore = useThemeStore();
  const { workspace } = storeToRefs(useAuthStore());
  const { getCurrentList } = useStateStore();
  const { selectedModule, currentCard } = storeToRefs(useStateStore());

  const { confirmDelete, copyLink } = useCard();
  const router = useRouter();
  const { fields, assigneeField } = useFields({
    cardTypeId: cardTypeId as Ref<number>,
    listId: currentListId as Ref<number>,
    enabled: fieldsEnabled,
  });

  const systemCommands = computed(() => {
    const commands = [
      {
        id: 'create-workspace',
        section: 'Workspace',
        icon: 'mdi-briefcase-plus-outline',
        title: 'Create workspace',
        action: () =>
          dialogStore.openDialog({
            dialog: DIALOGS.CREATE_WORKSPACE,
            options: {
              fullscreen: true,
            },
          }),
        shortcut: ['W'],
      },
      {
        id: 'edit-workspace',
        section: 'Workspace',
        icon: 'mdi-briefcase-edit',
        title: 'Update current workspace',
        action: () => router.push('/settings/' + SETTINGS.WORKSPACE),
        shortcut: ['F2'],
      },
      {
        id: 'manage-project-members',
        section: 'Project',
        icon: 'mdi-account-multiple-outline',
        title: 'Invite and manage members',
        action: () => router.push('/settings/' + SETTINGS.PROJECT_MEMBERS),
      },
      {
        id: 'settings',
        section: 'Settings',
        icon: 'mdi-cog',
        title: 'Settings',
        action: () => router.push('/settings/' + SETTINGS.THEME),
        shortcut: [','],
      },
      {
        id: 'settings-theme',
        section: 'Settings',
        icon: 'mdi-monitor-screenshot',
        title: 'Theme',
        action: () => router.push('/settings/' + SETTINGS.THEME),
      },
      {
        id: 'toggle-theme',
        section: 'Settings',
        icon: 'mdi-theme-light-dark',
        title: 'Toggle theme',
        shortcut: [leaderKey, 'Shift', 'T'],
        action: () => themeStore.toggleTheme(),
      },
      {
        id: 'settings-card-types',
        section: 'Settings',
        icon: 'mdi-toy-brick-outline',
        title: 'Card types',
        action: () => router.push('/settings/' + SETTINGS.CARD_TYPES),
      },
      {
        id: 'settings-fields',
        section: 'Settings',
        icon: 'mdi-form-select',
        title: 'Custom fields',
        action: () => router.push('/settings/' + SETTINGS.CUSTOM_FIELDS),
      },
      {
        id: 'contact-support',
        section: 'Support',
        icon: 'mdi-face-agent',
        title: 'Contact support',
        action: () => window.open('https://discord.gg/Ttn4WeNJbb', '_blank'),
      },
      {
        id: 'open-docs',
        section: 'Support',
        icon: 'mdi-text-box-outline',
        title: 'Documentation',
        action: () => window.open('https://docs.tilly.work', '_blank'),
        shortcut: ['F1'],
      },
    ];

    if (workspace.value?.type === WorkspaceTypes.PROJECT_MANAGEMENT) {
      commands.unshift({
        id: 'create-space',
        section: 'Spaces',
        icon: 'mdi-folder-plus',
        title: 'Create space',
        action: () =>
          dialogStore.openDialog({
            dialog: DIALOGS.UPSERT_SPACE,
            options: {
              width: DIALOG_WIDTHS[DIALOGS.UPSERT_SPACE],
            },
            data: {
              mode: UpsertDialogMode.CREATE,
            },
          }),
        shortcut: ['S'],
      });
    }

    return commands;
  });

  const cardTypeCommands = computed(() => {
    const commands = [];

    if (workspace.value) {
      if (!workspace.value.cardTypes?.length) {
        console.error('[CommandStore] Workspace has no card types.');
        return [];
      }

      if (!selectedModule.value) {
        console.error('[CommandStore] State store has no selected module.');
        return [];
      }

      for (const cardType of workspace.value.cardTypes) {
        commands.push({
          id: `create-${cardType.name.toLowerCase()}`,
          section: cardType.name,
          icon: 'mdi-card-plus-outline',
          title: 'Create ' + lowerFirst(cardType.name),
          action: () =>
            dialogStore.openDialog({
              dialog: DIALOGS.CREATE_CARD,
              options: {
                width: DIALOG_WIDTHS[DIALOGS.CREATE_CARD],
              },
              data: {
                type: cardType,
                list: currentList.value,
              },
            }),
          shortcut:
            cardType.id === workspace.value?.defaultCardType.id
              ? ['N']
              : undefined,
        });
      }
    }

    return commands;
  });

  const cardCommands = computed(() => {
    const commands: Command[] = [];

    if (currentCard.value) {
      if (assigneeField.value) {
        commands.push({
          id: 'assign-to',
          section: '',
          icon: assigneeField.value.icon,
          title: 'Assign to..',
          action: () => console.log('assign-to'),
          shortcut: ['A'],
        });

        commands.push({
          id: 'assign-to-me',
          section: '',
          icon: assigneeField.value.icon,
          title: 'Assign to me',
          action: () => console.log('assign-to-me'),
          shortcut: ['I'],
        });
      }

      const fieldCommands = fields.value
        .filter((f) => !f.isAssignee)
        .map((field) => ({
          id: `update-${field.slug}`,
          section: '',
          icon: field.icon,
          title: setCommandTitleByField(field),
          action: () => console.log(field.type),
        }));

      fieldCommands.forEach((fc) => commands.push(fc));

      commands.push({
        id: 'copy-link',
        section: '',
        icon: 'mdi-link',
        title: `Copy ${currentCard.value.type.name.toLowerCase()} link`,
        action: () => copyLink(currentCard.value as Card),
      });

      commands.push({
        id: 'open-card',
        section: 'Navigation',
        icon: 'mdi-open-in-new',
        title: `Open ${currentCard.value.type.name.toLowerCase()}`,
        action: () => router.push(`/card/${currentCard.value?.id}`),
        shortcut: ['O'],
      });

      commands.push({
        id: 'delete-card',
        section: '',
        icon: 'mdi-delete-outline',
        title: `Delete ${currentCard.value.type.name.toLowerCase()}`,
        action: () => confirmDelete(currentCard.value as Card),
        shortcut: ['DEL'],
      });
    }

    return commands;
  });

  const commands = computed<Command[]>(() => [
    ...cardCommands.value,
    ...cardTypeCommands.value,
    ...systemCommands.value,
  ]);

  function setCommandTitleByField(field: Field) {
    if (currentCard.value && !currentCard.value.data[field.slug]) {
      return `Set ${field.name.toLowerCase()}`;
    }

    return `Update ${field.name.toLowerCase()}`;
  }

  return {
    isOpen,
    commands,
  };
});
