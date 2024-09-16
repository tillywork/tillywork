import { CardType } from '../card-types';
import { List } from '../lists';
import { User } from '../users';

export interface Field {
  id: number;
  name: string;
  slug: string;
  type: FieldTypes;
  icon: string;
  workspaceId: number;
  required: boolean;
  multiple: boolean;
  dataCardType?: CardType;
  items?: FieldItem[];
  createdByType: 'system' | 'user';
  createdBy?: User;
  lists?: List[];
  isTitle: boolean;
  isDescription: boolean;
  isPhoto: boolean;
  isAssignee: boolean;
  isPinned: boolean;
}

export interface CreateFieldDto {
  name: string;
  slug: string;
  type: FieldTypes;
  icon: string;
  workspaceId: number;
  required?: boolean;
  multiple?: boolean;
  items?: FieldItem[];
  dataCardType?: CardType;
  lists?: List[];
}

export enum FieldTypes {
  TEXT = 'text',
  TEXT_AREA = 'text_area',
  DROPDOWN = 'dropdown',
  LABEL = 'label',
  USER = 'user',
  DATE = 'date',
  NUMBER = 'number',
  CHECKBOX = 'checkbox',
  EMAIL = 'email',
  URL = 'url',
  CURRENCY = 'currency',
  STAGE = 'stage',
  RICH = 'rich',
  CARD = 'card',
}

export const FIELD_TYPE_OPTIONS = [
  {
    title: 'Short Text',
    value: FieldTypes.TEXT,
  },
  {
    title: 'Dropdown',
    value: FieldTypes.DROPDOWN,
  },
  {
    title: 'Label',
    value: FieldTypes.LABEL,
  },
  {
    title: 'Date',
    value: FieldTypes.DATE,
  },
  {
    title: 'User',
    value: FieldTypes.USER,
  },
  {
    title: 'Relation',
    value: FieldTypes.CARD,
  },
];

export const DEFAULT_CARD_FIELDS: Partial<Field>[] = [
  {
    name: 'title',
    type: FieldTypes.TEXT,
    required: true,
    multiple: false,
  },
  {
    name: 'description',
    type: FieldTypes.RICH,
    required: false,
    multiple: false,
  },
  {
    name: 'dueAt',
    type: FieldTypes.DATE,
    required: false,
    multiple: false,
  },
  {
    name: 'users',
    type: FieldTypes.USER,
    required: false,
    multiple: true,
  },
];

export type FieldItem = {
  item: string;
  color?: string;
  icon?: string;
};
