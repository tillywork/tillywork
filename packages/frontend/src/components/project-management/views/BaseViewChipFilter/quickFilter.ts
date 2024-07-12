import type { FieldFilterOption } from './types';
import { FieldTypes } from '../../fields/types';

const availableGroups = [
  'date',
  'assignee',
  'stage',
  'dropdown',
  'label',
] as const;

export type QuickFilterGroup = (typeof availableGroups)[number];

const dateItems: FieldFilterOption[] = [
  {
    title: 'No Due Date',
    field: 'card.dueAt',
    operator: 'isNull',
    value: [],
    type: FieldTypes.DATE,
    icon: 'mdi-clock-time-twelve',
  },
  {
    title: 'Today',
    field: 'card.dueAt',
    operator: 'between',
    value: [':startOfDay', ':endOfDay'],
    type: FieldTypes.DATE,
    icon: 'mdi-clock-time-six-outline',
  },
  {
    title: 'Past Due',
    field: 'card.dueAt',
    operator: 'between',
    value: [':startOfTime', ':endOfDay'],
    type: FieldTypes.DATE,
    icon: 'mdi-clock-time-eight',
  },
];

const assigneeItems: FieldFilterOption[] = [
  {
    title: 'No Assignee',
    field: 'users.id',
    operator: 'isNull',
    value: [],
    type: FieldTypes.USER,
    icon: 'mdi-account',
  },
];

export const defaultGroupedItems: Record<
  QuickFilterGroup,
  FieldFilterOption[]
> = {
  date: dateItems,
  assignee: assigneeItems,
  stage: [],
  dropdown: [],
  label: [],
};
