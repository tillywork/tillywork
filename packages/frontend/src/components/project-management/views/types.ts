import type { List, ListGroupOptions } from '../lists/types';

export interface View {
  id: number;
  name: string;
  type: ViewTypes;
  listId: number;
  list: List;
  groupBy: ListGroupOptions;
}

export enum ViewTypes {
  TABLE = 'table',
  BOARD = 'board',
  CALENDAR = 'calendar',
  GANTT = 'gantt',
}

export interface ListGroupOption {
  label: string;
  value: ListGroupOptions;
}
