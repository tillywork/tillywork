/* eslint-disable @typescript-eslint/no-explicit-any */
import type { User } from '@/components/common/users/types';
import type { Content } from '@tiptap/vue-3';
import type { List, ListStage } from '../lists/types';
import type { Workspace } from '../workspaces/types';

export interface Card {
  id: number;
  title: string;
  description: Content;
  cardLists: CardList[];
  users: User[];
  data: Record<number, any>;
  type: CardType;
  startsAt: string;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
  parent?: Card;
  children: Card[];
}

export interface CardList {
  id: number;
  listId: number;
  cardId: number;
  list: List;
  listStageId: number;
  listStage: ListStage;
  order: number;
}

export interface CreateCardDto {
  title: string;
  /** The ID of the Card Type being created. */
  type: number;
  listId?: number;
  listStageId?: number;
  description?: Content;
  startsAt?: string;
  dueAt?: string;
  users?: User[];
  listStage?: ListStage;
}

export enum ActivityType {
  UPDATE = 'UPDATE',
  COMMENT = 'COMMENT',
}

export type ActivityContent = {
  [key: string]: any;
};

export interface CardActivity {
  id: number;
  card: Card;
  type: ActivityType;
  content: ActivityContent;
  createdAt: Date;
  createdBy: User;
}

/**
 * This is where entities like Task are derived from Card entity.
 */
export type CardType = {
  id: number;
  name: string;
  workspace: Workspace;
  createdByType: 'system' | 'user';
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCardTypeDto = {
  name: string;
  workspaceId: number;
};
