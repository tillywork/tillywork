import { CardType, List, ListStage, User, Workspace } from '../..';

export * from './card.activity';

export interface Card {
  id: number;
  cardLists: CardList[];
  users: User[];
  data: Record<string, any>;
  type: CardType;
  createdAt: string;
  updatedAt: string;
  parent?: Card;
  children: Card[];
  workspace: Workspace;
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
