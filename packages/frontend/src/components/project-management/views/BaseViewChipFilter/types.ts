import type { FieldFilter } from '../../filters/types';
import type { FieldItem, FieldTypes } from '../../fields/types';

export type FieldFilterOption = FieldFilter & {
  title: string;
  type: FieldTypes;
  icon?: string;
  options?: FieldItem[];
};
