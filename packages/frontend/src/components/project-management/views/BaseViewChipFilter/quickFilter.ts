import { FieldTypes, type FieldFilterOption } from '@tillywork/shared';

export const quickFilterGroupsCustomFields = [
  FieldTypes.DROPDOWN,
  FieldTypes.LABEL,
  FieldTypes.DATE,
  FieldTypes.USER,
];

export const quickFilterDateOptions: Omit<FieldFilterOption, 'field'>[] = [
  {
    title: 'Today',
    type: FieldTypes.DATE,
    operator: 'between',
    value: [':startOfDay', ':endOfDay'],
  },
  {
    title: 'This Week',
    type: FieldTypes.DATE,
    operator: 'between',
    value: [':startOfWeek', ':endOfWeek'],
  },
  {
    title: 'Last Week',
    type: FieldTypes.DATE,
    operator: 'between',
    value: [':startOfLastWeek', ':endOfLastWeek'],
  },
  {
    operator: 'between',
    value: [':startOfTime', ':startOfDay'],
    title: 'Past Due',
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
