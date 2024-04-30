import type { CardsData } from '@/composables/services/useCardsService';
import type { PaginationParams, QueryFilter } from '../views/TableView/types';
import type { View } from '../views/types';

export interface List {
  id: number;
  name: string;
  spaceId: number;
  listStages: ListStage[];
  views: View[];
}

export interface ListStage {
  id: number;
  name: string;
  listId: number;
  color: string;
}

export enum ListGroupOptions {
  ALL = 'ALL',
  LIST_STAGE = 'LIST_STAGE',
  ASSIGNEES = 'ASSIGNEES',
  DUE_DATE = 'DUE_DATE',
}

export interface ListGroup {
  id: number;
  name: string;
  listId: number;
  entityId?: number;
  color?: string;
  filter?: QueryFilter;
  options?: PaginationParams;
  isExpanded?: boolean;
  cards?: CardsData;
}

export const DEFAULT_LIST_GROUP_BY_OPTIONS = [
  {
    label: 'Stage',
    value: ListGroupOptions.LIST_STAGE,
  },
  {
    label: 'Assignee',
    value: ListGroupOptions.ASSIGNEES,
  },
  {
    label: 'Due Date',
    value: ListGroupOptions.DUE_DATE,
  },
];
