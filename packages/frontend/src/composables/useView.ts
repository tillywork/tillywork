import { useCardsService, type CardsData } from '@/services/useCardsService';
import { useInfiniteQuery } from '@tanstack/vue-query';
import type {
  Card,
  List,
  ListGroup,
  QueryFilter,
  SortOption,
  View,
} from '@tillywork/shared';
import type { MaybeRef } from 'vue';

export const useView = ({
  view,
  list,
  groups,
}: {
  view: MaybeRef<View>;
  list: MaybeRef<List>;
  groups: MaybeRef<ListGroup[]>;
}) => {
  const { getCards } = useCardsService();

  const allQueries = computed(() => {
    return toValue(groups).map((group) => {
      const query = useInfiniteQuery({
        queryFn: ({ pageParam = 1 }) =>
          getCards({
            listId: toValue(list).id,
            hideCompleted: toValue(view).options.hideCompleted ?? false,
            hideChildren: toValue(view).options.hideChildren ?? false,
            page: pageParam,
            limit: 15,
            filters: toValue(view).filters as QueryFilter,
            sortBy: toValue(view).options.sortBy
              ? [toValue(view).options.sortBy as SortOption]
              : [],
          }),
        queryKey: ['cards', { listId: toValue(list).id, groupId: group.id }],
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
          if (lastPage?.cards.length === 0) {
            return undefined;
          }

          return lastPageParam + 1;
        },
        initialPageParam: 1,
      });

      return query;
    });
  });

  // Get all cards from all queries
  const allCards = computed(() => {
    const cards: Card[] = [];
    allQueries.value.forEach((query) => {
      const pages = query.data?.value?.pages;
      if (pages) {
        pages.forEach((page: CardsData) => {
          cards.push(...page.cards);
        });
      }
    });
    return cards;
  });

  return {
    allQueries,
    allCards,
  };
};
