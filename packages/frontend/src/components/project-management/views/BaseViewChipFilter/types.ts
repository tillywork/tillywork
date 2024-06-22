import type { FieldFilter } from '../../filters/types';
import type { FieldTypes } from '../../fields/types';

export type FieldFilterOption = FieldFilter & {
  title: string;
  type: FieldTypes;
  icon: string;
};
