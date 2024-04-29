import type { User } from '@/components/common/users/types';
import type { List, ListStage } from '../lists/types';

export interface Card {
  id: number;
  title: string;
  description: string;
  cardLists: CardList[];
  users: User[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  dueAt: string;
  createdAt: string;
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
  listId: number;
  listStageId: number;
}
