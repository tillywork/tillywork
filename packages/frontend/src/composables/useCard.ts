import type { ContextMenuItem } from '@/components/common/base/ContextMenu/types';
import { DIALOGS } from '@/components/common/dialogs/types';
import { useCardsService } from '@/services/useCardsService';

import { useDialogStore } from '@/stores/dialog';
import { useSnackbarStore } from '@/stores/snackbar';

import { FieldTypes, type Card, type Field } from '@tillywork/shared';

import { cloneDeep } from 'lodash';

export const useCard = () => {
  const { showSnackbar } = useSnackbarStore();
  const dialog = useDialogStore();

  const {
    useUpdateCardMutation,
    useDeleteCardMutation,
    useUpdateCardListMutation,
  } = useCardsService();
  const { mutateAsync: updateCard } = useUpdateCardMutation();
  const { mutateAsync: deleteCard, isPending: isDeleting } =
    useDeleteCardMutation();
  const { mutateAsync: updateCardList } = useUpdateCardListMutation();

  const { copy } = useClipboard();

  function updateFieldValue({
    card,
    field,
    v,
  }: {
    card: Card;
    field: Field;
    v: any;
  }): Promise<Card> {
    const cardCopy = ref(cloneDeep(card));
    cardCopy.value.data[field.slug] = normalizeFieldValue({ v, field });

    return updateCard(cardCopy.value);
  }

  function normalizeFieldValue({ v, field }: { v: any; field: Field }) {
    let newValue: any;
    switch (field.type) {
      case FieldTypes.DROPDOWN:
      case FieldTypes.LABEL:
      case FieldTypes.USER:
      case FieldTypes.CARD:
        newValue = Array.isArray(v)
          ? v.map((item) => (item.item ? item.item : item.toString()))
          : v
          ? [v.item ? v.item : v.toString()]
          : undefined;
        break;
      case FieldTypes.CHECKBOX:
      case FieldTypes.NUMBER:
        newValue = v;
        break;
      default:
        newValue = Array.isArray(v)
          ? v.map((item) => (item.item ? item.item : item.toString()))
          : v
          ? v.toString()
          : undefined;
    }

    newValue = Array.isArray(newValue)
      ? newValue.length && !!newValue[0]
        ? newValue
        : undefined
      : newValue;

    return newValue;
  }

  function confirmDelete(card: Card, cb?: () => void) {
    dialog.openDialog({
      dialog: DIALOGS.CONFIRM,
      data: {
        message: `Are you sure you want to delete this ${
          card.type?.name.toLowerCase() ?? 'card'
        }?`,
        onConfirm: () => handleDeleteCard(card, cb),
      },
    });
  }

  function handleDeleteCard(card: Card, cb?: () => void) {
    if (!isDeleting.value) {
      deleteCard(card.id)
        .catch(() =>
          showSnackbar({
            message: `Something went wrong while deleting this ${
              card.type?.name.toLowerCase() ?? 'card'
            }`,
            color: 'error',
          })
        )
        .finally(() => {
          if (cb) {
            cb();
          }

          dialog.closeDialog(dialog.getDialogIndex(DIALOGS.CONFIRM));
        });
    }
  }

  function copyLink(card: Card, cb?: () => void) {
    const fullUrl = `${window.location.origin}/card/${card.id}`;
    copy(fullUrl).then(() => {
      showSnackbar({
        message: `${
          card.type?.name ?? 'Card'
        } link was copied to your clipboard.`,
      });

      if (cb) {
        cb();
      }
    });
  }

  function getCardContextMenuItems(
    card: Card,
    cb?: () => void
  ): ContextMenuItem[] {
    return [
      {
        title: 'Copy link',
        icon: 'mdi-link',
        action: () => copyLink(card, cb),
      },
      {
        title: 'Delete',
        icon: 'mdi-delete-outline',
        action: () => confirmDelete(card, cb),
        shortcut: ['DEL'],
      },
    ];
  }

  function updateCardStage({
    cardId,
    cardListId,
    listStageId,
  }: {
    cardId: number;
    cardListId: number;
    listStageId: number;
  }) {
    updateCardList({
      cardId,
      cardListId,
      updateCardListDto: {
        listStageId,
      },
    }).catch(() => {
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
        timeout: 5000,
      });
    });
  }

  return {
    updateFieldValue,
    normalizeFieldValue,
    confirmDelete,
    copyLink,
    getCardContextMenuItems,
    updateCard,
    updateCardStage,
  };
};
