import type { User } from '@/components/common/users/types';
import type { List, ListStage } from '../lists/types';
import type { Content } from '@tiptap/vue-3';

export interface Card {
  id: number;
  title: string;
  description: Content;
  cardLists: CardList[];
  users: User[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
}

export interface CreateCardDto {
  title: string;
  listId?: number;
  listStageId?: number;
  description?: Content;
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
