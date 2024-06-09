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
  | 'like%' // starts with
  | '%like' // ends with
  | 'between' // between two values
  | 'nbetween' // not between two values
  | 'isNull' // checks if a value is null
  | 'isNotNull'; // value is not null

export interface FieldFilter {
  field: string;
  operator: FilterOperator;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
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
