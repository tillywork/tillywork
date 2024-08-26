import type { FieldFilter } from '../../filters/types';
import type {
  Field,
  FieldItem,
  FieldTypes,
} from '../../../common/fields/types';

export type FieldFilterOption = FieldFilter & {
  title: string;
  type: FieldTypes;
  icon?: string;
  options?: FieldItem[];
  original?: Field;
};

export type FilterViewOptions = 'quick' | 'advanced';
