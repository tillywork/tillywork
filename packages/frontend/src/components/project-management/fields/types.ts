import type { User } from '@/components/common/users/types';
import type { List } from '../lists/types';

export interface Field {
  id: number;
  name: string;
  type: FieldTypes;
  icon: string;
  workspaceId: number;
  required: boolean;
  multiple: boolean;
  items?: FieldItem[];
  createdByType: 'system' | 'user';
  createdBy?: User;
  lists?: List[];
}

export interface CreateFieldDto {
  name: string;
  type: FieldTypes;
  icon: string;
  workspaceId: number;
  required?: boolean;
  multiple?: boolean;
  items?: FieldItem;
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
  color: string;
};
