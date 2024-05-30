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

export type FilterOperator =
  | 'eq' // equals
  | 'ne' // not equal
  | 'gt' // greater than
  | 'lt' // less than
  | 'gte' // greater than or equal to
  | 'lte' // less than or equal to
  | 'in' // is in an array of values
  | 'nin' // is not in an array of values
  | 'like' // like (pattern matching)
  | 'between' // between two values
  | 'isNull'; // checks if a value is null

export interface FieldFilter {
  field: string;
  operator: FilterOperator;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any; // Value can depend on the operator, like an array for 'in' & 'nin', range for 'between', etc.
}

export interface FilterGroup {
  and?: (FieldFilter | FilterGroup)[];
  or?: (FieldFilter | FilterGroup)[];
}

export interface QueryFilter {
  where?: FilterGroup;
  // We can add more properties from TypeORM FindOptions (like take, skip, relations, etc.) as required.
}

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
