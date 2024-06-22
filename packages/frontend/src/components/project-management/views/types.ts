import type { Filter } from '../filters/types';
import type { List, ListGroupOptions } from '../lists/types';

export interface View {
  id: number;
  name: string;
  type: ViewTypes;
  listId: number;
  list: List;
  groupBy: ListGroupOptions;
  sortBy?: TableSortOption;
  updatedAt: string;
  filters?: Filter;
}

export enum ViewTypes {
  TABLE = 'table',
  BOARD = 'board',
  CALENDAR = 'calendar',
  GANTT = 'gantt',
  LIST = 'list',
}

export interface ListGroupOption {
  label: string;
  value: ListGroupOptions;
}

export type SortDirection = 'ASC' | 'DESC';

export interface ListSortOption {
  label: string;
  value: TableSortOption;
}

export const DEFAULT_SORT_OPTIONS: ListSortOption[] = [
  {
    label: 'Creation Date',
    value: {
      key: 'card.createdAt',
      order: 'ASC',
    },
  },
  {
    label: 'Due Date',
    value: {
      key: 'card.dueAt',
      order: 'ASC',
    },
  },
];

export interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
  sort?: TableSortState;
}

export interface TableSortOption {
  key: string;
  order: string;
}

export type TableSortState = TableSortOption[];

export const DEFAULT_PAGINATION_OPTIONS: PaginationParams = {
  sort: [
    {
      key: 'createdAt',
      order: 'asc',
    },
  ],
  page: 1,
  itemsPerPage: 5,
};
