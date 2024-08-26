import type { FieldFilterOption } from './types';
import { FieldTypes } from '../../../common/fields/types';

export const quickFilterGroupsCustomFields = ['dropdown', 'label'];

export const quickFilterItemsDate: FieldFilterOption[] = [
  {
    title: 'Today',
    type: FieldTypes.DATE,
    field: 'card.data.due_at',
    operator: 'between',
    value: [':startOfDay', ':endOfDay'],
  },
  {
    title: 'This Week',
    type: FieldTypes.DATE,
    field: 'card.data.due_at',
    operator: 'between',
    value: [':startOfWeek', ':endOfWeek'],
  },
  {
    title: 'Last Week',
    type: FieldTypes.DATE,
    field: 'card.data.due_at',
    operator: 'between',
    value: [':startOfLastWeek', ':endOfLastWeek'],
  },
  {
    field: 'card.data.due_at',
    operator: 'between',
    value: [':startOfTime', ':startOfDay'],
    title: 'Past Due',
    type: FieldTypes.DATE,
  },
  {
    field: 'card.data.due_at',
    operator: 'isNull',
    value: [],
    title: 'No Due Date',
    type: FieldTypes.DATE,
  },
];

export type QuickFilterGroup = {
  name: string;
  field: string;
  icon: string;
  options: FieldFilterOption[];
};

export type QuickFilter = QuickFilterGroup[];
