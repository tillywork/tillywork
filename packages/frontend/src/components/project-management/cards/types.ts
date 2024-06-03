/* eslint-disable @typescript-eslint/no-explicit-any */
import type { User } from '@/components/common/users/types';
import type { Content } from '@tiptap/vue-3';
import type { List, ListStage } from '../lists/types';

export interface Card {
  id: number;
  title: string;
  description: Content;
  cardLists: CardList[];
  users: User[];
  data: any;
  dueAt: string;
  createdAt: string;
  updatedAt: string;
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
