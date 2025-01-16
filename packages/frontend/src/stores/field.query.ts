import { useStateStore } from './state';

import { type CardType, type List } from '@tillywork/shared';
import { useFields } from '@/composables/useFields';

export const useFieldQueryStore = defineStore('fieldQuery', () => {
  const { getCurrentList } = useStateStore();

  const list = computed<List | undefined>(() => getCurrentList());
  const cardType = computed<CardType | undefined>(
    () => list.value?.defaultCardType
  );

  const listId = computed<number>(() => list.value?.id as number);
  const cardTypeId = computed<number>(() => cardType.value?.id as number);

  const fieldManager = useFields({
    listId,
    cardTypeId,
    enabled: computed(() => !!list.value),
  });

  return {
    ...fieldManager,
  };
});
