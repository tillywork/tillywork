import type { Card } from '@/components/project-management/cards/types';
import type { Field } from '@/components/project-management/fields/types';
import { useCardsService } from '@/services/useCardsService';
import { useSnackbarStore } from '@/stores/snackbar';
import { cloneDeep } from 'lodash';

export const useCard = () => {
  const { showSnackbar } = useSnackbarStore();
  const { useUpdateCardMutation } = useCardsService();
  const { mutateAsync: updateCard } = useUpdateCardMutation();

  function updateFieldValue({
    card,
    field,
    v,
  }: {
    card: Card;
    field: Field;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    v: any;
  }) {
    const cardCopy = cloneDeep(card);
    cardCopy.data[field.slug] = Array.isArray(v)
      ? v.length && !!v[0]
        ? v
        : undefined
      : v;

    updateCard(cardCopy).catch(() => {
      showSnackbar({
        message: 'Something went wrong, please try again.',
        color: 'error',
      });
    });
  }

  return {
    updateFieldValue,
  };
};
