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
  isPinned?: boolean;
}

export enum FieldTypes {
  TEXT = 'text',
  TEXT_AREA = 'text_area',
  DROPDOWN = 'dropdown',
  LABEL = 'label',
  USER = 'user',
  DATE = 'date',
  DATETIME = 'date_time',
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
    title: 'Date & Time',
    value: FieldTypes.DATETIME,
  },
  {
    title: 'User',
    value: FieldTypes.USER,
  },
  {
    title: 'Relation',
    value: FieldTypes.CARD,
  },
  {
    title: 'Checkbox',
    value: FieldTypes.CHECKBOX,
  },
  {
    title: 'Number',
    value: FieldTypes.NUMBER,
  },
  {
    title: 'Email',
    value: FieldTypes.EMAIL,
  },
];

export type FieldItem = {
  item: string;
  color?: string;
  icon?: string;
};
