import type { FieldFilter } from '../../filters/types';
import type { PropTypes } from '../../props/types';

export type FieldFilterOption = FieldFilter & {
  title: string;
  type: PropTypes;
  icon: string;
};
