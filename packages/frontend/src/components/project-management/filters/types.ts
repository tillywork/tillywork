import type { FilterGroup } from '../views/types';

export type Filter = {
  id: number;
  name?: string;
  where: FilterGroup;
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
  where: FilterGroup;
  entityId: number;
  entityType: FilterEntityTypes;
};
