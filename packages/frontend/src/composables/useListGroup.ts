/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DIALOGS } from '@/components/common/dialogs/types';
import { useCardsService } from '@/services/useCardsService';
import { useDialogStore } from '@/stores/dialog';
import { useSnackbarStore } from '@/stores/snackbar';
import {
  type ListStage,
  ListGroupOptions,
  FieldTypes,
  type ProjectUser,
  type View,
  type SortOption,
  type ListGroup,
  type Card,
  type FieldFilter,
  dayjs,
} from '@tillywork/shared';
import { cloneDeep } from 'lodash';
import { useCard } from './useCard';
import type { Row } from '@tanstack/vue-table';

interface UseListGroupEmits {
  (e: 'card:update:order' | 'card:update:stage', value: unknown): void;
}

export const useListGroup = ({
  props,
  emit,
  cards,
}: {
  props: {
    listGroup: ListGroup | Row<ListGroup>;
    listStages: ListStage[];
    projectUsers: ProjectUser[];
    view: View;
  };
  emit: UseListGroupEmits;
  cards: Ref<(Card | Row<Card>)[]>;
}) => {
  const isDragging = ref(false);

  const listGroup = computed(() =>
    'original' in props.listGroup ? props.listGroup.original : props.listGroup
  );
  const sortBy = computed<SortOption[]>(() =>
    props.view.options.sortBy ? [cloneDeep(props.view.options.sortBy)] : []
  );
  const isDraggingDisabled = computed(() => {
    return sortBy.value && sortBy.value.length > 0;
  });

  const dialog = useDialogStore();
  const { showSnackbar } = useSnackbarStore();

  const { updateFieldValue } = useCard();
  const { calculateCardOrder } = useCardsService();

  function openCreateCardDialog(listGroup: ListGroup) {
    const cardData: Record<string, unknown> = {};

    if (listGroup.type === ListGroupOptions.FIELD) {
      const value = getGroupValue();

      switch (listGroup.field?.type) {
        case FieldTypes.DROPDOWN:
        case FieldTypes.LABEL:
        case FieldTypes.USER:
          cardData[listGroup.field!.slug] = value ? [value] : undefined;
          break;

        case FieldTypes.DATE:
          cardData[listGroup.field!.slug] = getGroupValue();
          break;
      }
    }

    dialog.openDialog({
      dialog: DIALOGS.CREATE_CARD,
      data: {
        listId: listGroup.list.id,
        listStage: getGroupStage(listGroup),
        data: cardData,
        listStages: props.listStages,
      },
    });
  }

  function getGroupStage(group: ListGroup) {
    let stage: ListStage | undefined;

    if (group.type === ListGroupOptions.LIST_STAGE) {
      stage = props.listStages.find((stage) => {
        return stage.id == group.entityId;
      });
    }

    return stage ? { ...stage } : undefined;
  }

  function getGroupValue() {
    let value;
    switch (listGroup.value.field?.type) {
      case FieldTypes.DROPDOWN:
      case FieldTypes.LABEL:
        value = listGroup.value.field?.items?.find(
          (item) => item.item === listGroup.value.name
        )?.item;
        break;

      case FieldTypes.DATE: {
        const filter: FieldFilter = listGroup.value.filter?.where?.and?.find(
          (condition) =>
            (condition as FieldFilter).field ===
            `card.data.${listGroup.value.field?.slug ?? ''}`
        ) as FieldFilter;

        if (!filter) break;

        const today = new Date();
        today.setHours(23, 59, 59);

        switch (filter.operator) {
          case 'lt': {
            const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

            value = dayjs(yesterday).utc().format();
            break;
          }
          case 'gt': {
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

            value = dayjs(tomorrow).utc().format();
            break;
          }
          case 'between': {
            value = dayjs(today).utc().format();
            break;
          }
          default:
            value = undefined;
            break;
        }
        break;
      }

      case FieldTypes.USER:
        value = listGroup.value.entityId;
        break;
    }

    return value;
  }

  function onDragMove() {
    if (isDraggingDisabled.value) {
      isDragging.value = false;
      return false;
    }
  }

  function onDragStart() {
    isDragging.value = true;

    if (isDraggingDisabled.value) {
      showSnackbar({
        message: 'Dragging cards is only enabled when sorting is disabled.',
        color: 'error',
        timeout: 5000,
      });
    }
  }

  function onDragEnd() {
    isDragging.value = false;
  }

  function onDragUpdate(event: any) {
    const { newIndex } = event;
    isDragging.value = false;

    let previousCard = cards.value[newIndex - 1];
    let currentCard = cards.value[newIndex];
    let nextCard = cards.value[newIndex + 1];

    if ('original' in currentCard) {
      previousCard = (previousCard as Row<Card>)?.original;
      currentCard = (currentCard as Row<Card>).original;
      nextCard = (nextCard as Row<Card>)?.original;
    }

    emit('card:update:order', {
      currentCard,
      previousCard,
      nextCard,
    });
  }

  function onDragAdd(event: any) {
    const { newIndex } = event;
    isDragging.value = false;

    let previousCard = cards.value[newIndex - 1];
    let currentCard = cards.value[newIndex];
    let nextCard = cards.value[newIndex + 1];

    if ('original' in currentCard) {
      previousCard = (previousCard as Row<Card>)?.original;
      currentCard = (currentCard as Row<Card>).original;
      nextCard = (nextCard as Row<Card>)?.original;
    }

    const newOrder = calculateCardOrder({
      previousCard: previousCard as Card,
      nextCard: nextCard as Card,
    });

    switch (listGroup.value.type) {
      case ListGroupOptions.LIST_STAGE: {
        emit('card:update:stage', {
          cardId: currentCard.id,
          cardListId: currentCard.cardLists[0].id,
          listStageId: listGroup.value.entityId,
          order: newOrder,
        });
        break;
      }

      case ListGroupOptions.FIELD: {
        const newValue = getGroupValue();

        updateFieldValue({
          card: currentCard,
          field: listGroup.value.field!,
          v: newValue,
        });

        emit('card:update:order', {
          currentCard,
          previousCard,
          nextCard,
        });

        break;
      }
    }
  }

  function setDragItem(data: DataTransfer) {
    const img = new Image();
    img.src = 'https://en.wikipedia.org/wiki/File:1x1.png#/media/File:1x1.png';
    data.setDragImage(img, 0, 0);
  }

  return {
    openCreateCardDialog,
    onDragAdd,
    onDragEnd,
    onDragMove,
    onDragStart,
    onDragUpdate,
    setDragItem,
    isDragging,
  };
};
