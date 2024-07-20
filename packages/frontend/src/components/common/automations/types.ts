/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FieldFilter } from '@/components/project-management/filters/types';

export enum TriggerType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  DUE_DATE_APPROACHING = 'DUE_DATE_APPROACHING',
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_STATUS_CHANGED = 'PROJECT_STATUS_CHANGED',
  USER_ADDED = 'USER_ADDED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
}

export enum ActionType {
  CREATE_TASK = 'CREATE_TASK',
  UPDATE_TASK = 'UPDATE_TASK',
  MOVE_TASK = 'MOVE_TASK',
  ASSIGN_TASK = 'ASSIGN_TASK',
  SEND_EMAIL = 'SEND_EMAIL',
  SEND_SLACK_MESSAGE = 'SEND_SLACK_MESSAGE',
  SHOW_IN_APP_NOTIFICATION = 'SHOW_IN_APP_NOTIFICATION',
  CHANGE_PROJECT_STATUS = 'CHANGE_PROJECT_STATUS',
  UPDATE_PROJECT_DETAILS = 'UPDATE_PROJECT_DETAILS',
  EXECUTE_CUSTOM_SCRIPT = 'EXECUTE_CUSTOM_SCRIPT',
  CALL_WEBHOOK = 'CALL_WEBHOOK',
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerType: TriggerType;
  conditions: FieldFilter[];
  actions: { type: ActionType; params: any }[];
}
