import type { List, ListGroupOptions } from '../lists/types';
import type { TableSortOption } from './TableView/types';

export interface View {
  id: number;
  name: string;
  type: ViewTypes;
  listId: number;
  list: List;
  groupBy: ListGroupOptions;
  sortBy?: TableSortOption;
  updatedAt: string;
}

export enum ViewTypes {
  TABLE = 'table',
  BOARD = 'board',
  CALENDAR = 'calendar',
  GANTT = 'gantt',
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
      key: 'createdAt',
      order: 'ASC',
    },
  },
  {
    label: 'Due Date',
    value: {
      key: 'dueAt',
      order: 'ASC',
    },
  },
];
