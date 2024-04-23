import type { Card } from '../cards/types';
import type { PaginationParams, QueryFilter } from '../views/ListView/types';

export interface List {
  id: number;
  name: string;
  spaceId: number;
  listStages: ListStage[];
}

export interface ListStage {
  id: number;
  name: string;
  listId: number;
  color: string;
}

export enum ListGroupOptions {
  LIST_STAGE = 'LIST_STAGE',
  USERS = 'USERS',
}

export interface ListGroup {
  id: number;
  name: string;
  color?: string;
  filters: QueryFilter;
  options?: PaginationParams;
}
