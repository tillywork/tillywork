import { Field, FieldTypes } from '../..';

export function normalizeFieldValue({ v, field }: { v: any; field: Field }) {
  let newValue: any;
  switch (field.type) {
    case FieldTypes.DROPDOWN:
    case FieldTypes.LABEL:
    case FieldTypes.USER:
    case FieldTypes.CARD:
      newValue = Array.isArray(v)
        ? v.map((item) => (item.item ? item.item : item.toString()))
        : v
        ? [v.item ? v.item : v.toString()]
        : undefined;
      break;
    case FieldTypes.CHECKBOX:
    case FieldTypes.NUMBER:
      newValue = v;
      break;
    default:
      newValue = Array.isArray(v)
        ? v.map((item) => (item.item ? item.item : item.toString()))
        : v
        ? v.toString()
        : undefined;
  }

  newValue = Array.isArray(newValue)
    ? newValue.length && !!newValue[0]
      ? newValue
      : undefined
    : newValue;

  return newValue;
}
