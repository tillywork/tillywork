import type { User } from '@/modules/common/users/types';
import type { List, ListStage } from '../lists/types';

export interface Card {
  id: number;
  title: string;
  cardLists: CardList[];
  users: User[];
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
