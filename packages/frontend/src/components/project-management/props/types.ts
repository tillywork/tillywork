export interface Prop {
  name: string;
  type: PropTypes;
  listId: number;
  required: boolean;
}

export enum PropTypes {
  TEXT = 'text',
  TEXT_AREA = 'text_area',
  DROPDOWN = 'dropdown',
  LABEL = 'label',
  USER = 'user',
  DATE = 'date',
  NUMBER = 'number',
  CHECKBOX = 'checkbox',
  EMAIL = 'email',
  URL = 'url',
  CURRENCY = 'currency',
  STAGE = 'stage',
  RICH = 'rich',
}

export const DEFAULT_CARD_PROPS: Omit<Prop, 'listId'>[] = [
  {
    name: 'title',
    type: PropTypes.TEXT,
    required: true,
  },
  {
    name: 'description',
    type: PropTypes.RICH,
    required: false,
  },
  {
    name: 'dueAt',
    type: PropTypes.DATE,
    required: false,
  },
  {
    name: 'users',
    type: PropTypes.USER,
    required: false,
  },
];
