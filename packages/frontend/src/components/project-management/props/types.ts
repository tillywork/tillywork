export interface Prop {
  name: string;
  type: PropTypes;
  listId: number;
  required: boolean;
}

export enum PropTypes {
  TEXT = 'TEXT',
  TEXT_AREA = 'TEXT_AREA',
  DROPDOWN = 'DROPDOWN',
  LABEL = 'LABEL',
  USER = 'USER',
  DATE = 'DATE',
  NUMBER = 'NUMBER',
  CHECKBOX = 'CHECKBOX',
  EMAIL = 'EMAIL',
  URL = 'URL',
  CURRENCY = 'CURRENCY',
  STAGE = 'STAGE',
}
