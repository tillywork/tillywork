import { Field, List, PaginationParams, QueryFilter } from '../..';

export enum ListGroupOptions {
  ALL = 'all',
  LIST_STAGE = 'list_stage',
  FIELD = 'field',
}

export interface ListGroup {
  id: number;
  name: string;
  list: List;
  type: ListGroupOptions;
  entityId?: number;
  color?: string;
  icon?: string;
  filter?: QueryFilter;
  options?: PaginationParams;
  isExpanded?: boolean;
  field?: Field;
}
