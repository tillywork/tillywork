export enum TriggerType {
  CARD_CREATED = 'card_created',
  FIELD_UPDATED = 'field_updated',
  STAGE_CHANGED = 'stage_changed',
  COMMENT_CREATED = 'comment_created',
  DUE_DATE_ARRIVES = 'due_date_arrives',
  DUE_DATE_CHANGES = 'due_date_changes',
  START_DATE_ARRIVES = 'start_date_arrives',
  START_DATE_CHANGES = 'start_date_changes',
  ASSIGNEE_ADDED = 'assignee_added',
  ASSIGNEE_REMOVED = 'assignee_removed',
}

export enum ActionType {
  CREATE_CARD = 'create_card',
  SET_FIELD = 'set_field',
  CREATE_COMMENT = 'create_comment',
  CHANGE_ASSIGNEE = 'change_assignee',
}

export interface GetHandlerFieldsParams {
  automationId: string;
  type: ActionType | TriggerType;
  data?: Record<string, any>;
}
