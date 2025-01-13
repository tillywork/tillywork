import {
  type Field,
  type FilterOperator,
  FieldTypes,
  type FieldFilter,
} from '@tillywork/shared';
import objectUtils from './object';

export const filterUtils = {
  getOperatorFromFieldType(field: Field): FilterOperator {
    switch (field.type) {
      case FieldTypes.USER:
      case FieldTypes.DROPDOWN:
      case FieldTypes.LABEL:
      case FieldTypes.CARD:
        return 'in';
      case FieldTypes.DATETIME:
      case FieldTypes.DATE:
        return 'between';

      default:
        return 'eq';
    }
  },

  areFilterOptionsEqual(option1: FieldFilter, option2: FieldFilter) {
    return objectUtils.isEqual(option1, option2);
  },
};
