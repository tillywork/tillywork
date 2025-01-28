import { useHttp } from '@/composables/useHttp';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type UseInfiniteQueryReturnType,
} from '@tanstack/vue-query';
import type { MaybeRef } from 'vue';
import type {
  Card,
  CardList,
  CreateCardDto,
  QueryFilter,
  SortOption,
} from '@tillywork/shared';
import posthog from 'posthog-js';

export interface CardsData {
  cards: Card[];
  total: number;
}

export interface GetCardsParams {
  listId: number;
  hideCompleted: boolean;
  hideChildren?: boolean;
  page: number;
  limit: number;
  sortBy?: SortOption[];
  filters?: QueryFilter;
}

export interface GetGroupCardsInfiniteQueryParams {
  listId: number;
  groupId: number;
  hideCompleted: MaybeRef<boolean>;
  hideChildren?: MaybeRef<boolean>;
  initialCards?: CardsData;
  filters?: MaybeRef<QueryFilter>;
  sortBy?: MaybeRef<SortOption[] | undefined>;
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
        order: 'ASC',
      },
    ],
    filters,
  }: GetCardsParams): Promise<CardsData> {
    return sendRequest('/cards/search', {
      method: 'POST',
      data: {
        listId,
        hideCompleted,
        hideChildren,
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

  async function getCard(cardId: MaybeRef<number>): Promise<Card> {
    return sendRequest(`/cards/${toValue(cardId)}`, {
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
  }: GetGroupCardsInfiniteQueryParams): UseInfiniteQueryReturnType<
    InfiniteData<CardsData, unknown>,
    Error
  > {
    return useInfiniteQuery({
      queryFn: ({ pageParam = 1 }) =>
        getCards({
          listId: listId,
          hideCompleted: toValue(hideCompleted),
          hideChildren: toValue(hideChildren),
          page: pageParam,
          limit: 15,
          filters: toValue(filters),
          sortBy: toValue(sortBy),
        }),
      queryKey: ['cards', { listId, groupId }],
      getNextPageParam: (lastPage, allPages, lastPageParam) => {
        if (lastPage?.cards.length === 0) {
          return undefined;
        }

        return lastPageParam + 1;
      },
      initialPageParam: 1,
      initialData: () => ({
        pages: [initialCards ? initialCards : { cards: [], total: 0 }],
        pageParams: [1],
      }),
    });
  }

  function useCreateCardMutation() {
    return useMutation({
      mutationFn: createCard,
      onSuccess: (card) => {
        queryClient.invalidateQueries({ queryKey: ['cards'] });
        posthog.capture('Card Created', { id: card.id });
      },
    });
  }

  function useGetCardQuery({
    cardId,
    enabled,
  }: {
    cardId: MaybeRef<number>;
    enabled?: MaybeRef<boolean>;
  }) {
    return useQuery({
      queryKey: ['cards', cardId],
      queryFn: () => getCard(cardId),
      enabled,
    });
  }

  function useUpdateCardMutation() {
    return useMutation({
      mutationFn: updateCard,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cards'] });
        queryClient.invalidateQueries({ queryKey: ['cardActivities'] });
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
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cards'] });
        queryClient.invalidateQueries({ queryKey: ['cardActivities'] });
        queryClient.invalidateQueries({ queryKey: ['listGroups'] });
      },
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
          workspaceId,
          cardTypeId,
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
    getCards,
  };
};
