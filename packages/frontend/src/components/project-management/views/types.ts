import type { PaginationParams, ViewSortOption } from '@tillywork/shared';

export const DEFAULT_SORT_OPTIONS: ViewSortOption[] = [
  {
    label: 'Creation Date',
    icon: 'mdi-clock-edit',
    value: {
      key: 'card.createdAt',
      order: 'ASC',
    },
  },
];

export const DEFAULT_PAGINATION_OPTIONS: PaginationParams = {
  sort: [
    {
      key: 'createdAt',
      order: 'ASC',
    },
  ],
  page: 1,
  itemsPerPage: 5,
};
