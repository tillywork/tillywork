import { useHttp } from '@/composables/useHttp';
import type {
  Card,
  CardList,
  CreateCardDto,
} from '@/components/project-management/cards/types';
import type { TableSortOption } from '@/components/project-management/views/types';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query';
import type { QueryFilter } from '@/components/project-management/filters/types';
import type { MaybeRef } from 'vue';

export interface CardsData {
  cards: Card[];
  total: number;
}

export interface GetCardsParams {
  listId: number;
  hideCompleted: boolean;
  hideChildren?: MaybeRef<boolean>;
  page: number;
  limit: number;
  sortBy?: TableSortOption[];
  filters?: QueryFilter;
}

export interface GetGroupCardsInfiniteQueryParams {
  listId: number;
  groupId: number;
  hideCompleted: MaybeRef<boolean>;
  hideChildren?: MaybeRef<boolean>;
  initialCards?: CardsData;
  filters?: Ref<QueryFilter>;
  sortBy?: Ref<TableSortOption[] | undefined>;
}

export interface SearchCardsParams {
  keyword: MaybeRef<string>;
  workspaceId: MaybeRef<number>;
  cardTypeId?: MaybeRef<number>;
}

export const useCardsService = () => {
  const queryClient = useQueryClient();
  const { sendRequest } = useHttp();

  async function getCards({
    listId,
    hideCompleted,
    hideChildren,
    page = 1,
    limit = 10,
    sortBy = [
      {
        key: 'cardLists.order',
        order: 'asc',
      },
    ],
    filters,
  }: GetCardsParams): Promise<CardsData> {
    return sendRequest('/cards/search', {
      method: 'POST',
      data: {
        listId,
        hideCompleted,
        hideChildren: toValue(hideChildren),
        page,
        limit,
        sortBy: sortBy[0]?.key,
        sortOrder: sortBy[0]?.order,
        filters,
      },
    });
  }

  async function createCard(card: CreateCardDto): Promise<Card> {
    return sendRequest('/cards', {
      method: 'POST',
      data: card,
    });
  }

  async function getCard(cardId: number): Promise<Card> {
    return sendRequest(`/cards/${cardId}`, {
      method: 'GET',
    });
  }

  async function updateCard(card: Card): Promise<Card> {
    return sendRequest(`/cards/${card.id}`, {
      method: 'PUT',
      data: card,
    });
  }

  async function deleteCard(cardId: number): Promise<void> {
    return sendRequest(`/cards/${cardId}`, {
      method: 'DELETE',
    });
  }

  function useGetGroupCardsInfinite({
    listId,
    groupId,
    initialCards,
    hideCompleted,
    hideChildren,
    filters,
    sortBy,
  }: GetGroupCardsInfiniteQueryParams) {
    return useInfiniteQuery({
      queryFn: ({ pageParam = 1 }) =>
        getCards({
          listId: listId,
          hideCompleted: toValue(hideCompleted),
          hideChildren,
          page: pageParam,
          limit: 15,
          filters: filters?.value,
          sortBy: sortBy?.value,
        }),
      queryKey: ['cards', { groupId, filters: filters?.value }],
      getNextPageParam: (lastPage, allPages, lastPageParam) => {
        if (lastPage?.cards.length === 0) {
          return undefined;
        }

        return lastPageParam + 1;
      },
      initialPageParam: 1,
      initialData: () =>
        initialCards
          ? {
              pages: [initialCards],
              pageParams: [1],
            }
          : undefined,
    });
  }

  function useCreateCardMutation() {
    return useMutation({
      mutationFn: createCard,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cards'] });
      },
    });
  }

  function useGetCardQuery({ cardId }: { cardId: Ref<number> }) {
    return useQuery({
      queryKey: ['cards', cardId],
      queryFn: () => getCard(cardId.value),
    });
  }

  function useUpdateCardMutation() {
    return useMutation({
      mutationFn: updateCard,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cards'] });
      },
    });
  }

  function useDeleteCardMutation() {
    return useMutation({
      mutationFn: deleteCard,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cards'] });
      },
    });
  }

  async function updateCardList({
    cardId,
    cardListId,
    updateCardListDto,
  }: {
    cardId: number;
    cardListId: number;
    updateCardListDto: Partial<CardList>;
  }) {
    return sendRequest(`/cards/${cardId}/lists/${cardListId}`, {
      method: 'PUT',
      data: updateCardListDto,
    });
  }

  function useUpdateCardListMutation() {
    return useMutation({
      mutationFn: updateCardList,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cards'] }),
    });
  }

  function searchCards({
    keyword,
    workspaceId,
    cardTypeId,
  }: SearchCardsParams) {
    return sendRequest(`/cards`, {
      params: {
        q: toValue(keyword),
        workspaceId: toValue(workspaceId),
        cardTypeId: toValue(cardTypeId),
      },
    });
  }

  function useSearchCards({
    keyword,
    workspaceId,
    cardTypeId,
  }: SearchCardsParams) {
    return useQuery({
      queryKey: [
        'cards',
        {
          workspaceId: toValue(workspaceId),
          cardTypeId: toValue(cardTypeId),
        },
      ],
      queryFn: () => searchCards({ keyword, workspaceId, cardTypeId }),
      enabled: false,
    });
  }

  function calculateCardOrder({
    previousCard,
    nextCard,
  }: {
    previousCard?: Card;
    nextCard?: Card;
  }) {
    let newOrder: number;
    if (!previousCard && nextCard) {
      newOrder = nextCard.cardLists[0].order / 2;
    } else if (previousCard && !nextCard) {
      newOrder = previousCard.cardLists[0].order + 100;
    } else if (previousCard && nextCard) {
      newOrder =
        (nextCard.cardLists[0].order + previousCard.cardLists[0].order) / 2;
    } else {
      newOrder = 100;
    }

    newOrder = Math.round(newOrder);

    return newOrder;
  }

  return {
    useGetGroupCardsInfinite,
    useCreateCardMutation,
    useUpdateCardMutation,
    useGetCardQuery,
    useDeleteCardMutation,
    useUpdateCardListMutation,
    useSearchCards,
    searchCards,
    calculateCardOrder,
  };
};
