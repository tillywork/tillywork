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
