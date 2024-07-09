import type { CardsData } from '@/composables/services/useCardsService';
import type { PaginationParams } from '../views/types';
import type { View } from '../views/types';
import type { QueryFilter } from '../filters/types';
import type { CardType } from '../cards/types';

export interface List {
  id: number;
  icon: string;
  name: string;
  spaceId: number;
  listStages: ListStage[];
  views: View[];
  defaultCardType: CardType;
}

export interface ListStage {
  id: number;
  listId: number;
  name: string;
  color: string;
  order: number;
  isCompleted?: boolean;
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
  type: ListGroupOptions;
  entityId?: number;
  color?: string;
  icon?: string;
  filter?: QueryFilter;
  options?: PaginationParams;
  isExpanded?: boolean;
  cards?: CardsData;
}

export const DEFAULT_LIST_GROUP_BY_OPTIONS = [
  {
    label: 'Stage',
    value: ListGroupOptions.LIST_STAGE,
    icon: 'mdi-circle-slice-8',
  },
  {
    label: 'Assignee',
    value: ListGroupOptions.ASSIGNEES,
    icon: 'mdi-account',
  },
  {
    label: 'Due Date',
    value: ListGroupOptions.DUE_DATE,
    icon: 'mdi-clock-time-four',
  },
];
