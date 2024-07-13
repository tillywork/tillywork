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
    field: 'card.dueAt',
    operator: 'isNull',
    value: [],
    title: 'No Due Date',
    type: FieldTypes.DATE,
  },
  {
    field: 'card.dueAt',
    operator: 'isNotNull',
    value: [],
    title: 'Due Date',
    type: FieldTypes.DATE,
  },
  {
    title: 'Today',
    type: FieldTypes.DATE,
    field: 'card.dueAt',
    operator: 'between',
    value: [':startOfDay', ':endOfDay'],
  },
  {
    field: 'card.dueAt',
    operator: 'between',
    value: [':startOfTime', ':endOfDay'],
    title: 'Past Due',
    type: FieldTypes.DATE,
  },
];

const assigneeItems: FieldFilterOption[] = [
  {
    field: 'users.id',
    operator: 'isNull',
    value: [],
    title: 'No Assignee',
    type: FieldTypes.USER,
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
