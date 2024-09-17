import { FieldTypes, FieldItem, Field } from '../fields';

export type Filter = {
  id: number;
  name?: string;
  where: FilterGroup | ViewFilter;
  entityId: number;
  entityType: FilterEntityTypes;
  createdAt: string;
  updatedAt: string;
};

export enum FilterEntityTypes {
  VIEW = 'VIEW',
  LIST_GROUP = 'LIST_GROUP',
}

export type CreateFilterDto = {
  name?: string;
  where: FilterGroup | ViewFilter;
  entityId: number;
  entityType: FilterEntityTypes;
};

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
  | 'isNotNull' // value is not null
  | 'neOrNull';

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

export interface ViewFilter {
  where: {
    advanced?: FilterGroup;
    quick?: FilterGroup;
  };
}

export type FieldFilterOption = FieldFilter & {
  title: string;
  type: FieldTypes;
  icon?: string;
  options?: FieldItem[];
  original?: Field;
};

export type FilterViewOptions = 'quick' | 'advanced';
