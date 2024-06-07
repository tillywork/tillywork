import type { PropTypes } from '../../props/types';
import type { FieldFilter } from '../types';

export type FieldFilterOption = FieldFilter & {
  title: string;
  type: PropTypes;
  icon: string;
};
