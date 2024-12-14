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

export interface CreateCardDto {
  data: Record<string, any>;
  /** The ID of the Card Type being created. */
  type: number;
  workspaceId: number;
  listId?: number;
  listStageId?: number;
  users?: User[];
  listStage?: ListStage;
  parent?: Card;
}

export enum ActivityType {
  UPDATE = 'UPDATE',
  COMMENT = 'COMMENT',
  EMAIL = 'email',
  TASK = 'task',
  CALL = 'call',
  MESSAGE = 'message',
  MEETING = 'meeting',
}

export type ActivityTypeOption = {
  name: string;
  type: ActivityType;
  icon?: string;
};

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
