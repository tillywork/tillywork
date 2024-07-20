/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FieldFilter } from '@/components/project-management/filters/types';
import type { Workspace } from '@/components/project-management/workspaces/types';
import type { User } from '../users/types';

export enum TriggerType {
  CARD_CREATED = 'card_created',
  CARD_FIELD_CHANGED = 'card_field_changed',
  CARD_STAGE_CHANGED = 'card_stage_changed',
}

export enum ActionType {
  CREATE_CARD = 'create_card',
  UPDATE_CARD = 'update_card',
  CHANGE_CARD_STAGE = 'update_card_stage',
  ASSIGN_CARD = 'assign_card',
  SEND_EMAIL = 'send_email',
  SEND_WEBHOOK = 'send_webhook',
}

export interface Automation {
  id: string;
  name: string;
  workspace: Workspace;
  triggerType: TriggerType;
  conditions: FieldFilter[];
  isEnabled: boolean;
  firstAction: AutomationAction;
  createdByType: 'system' | 'user';
  createdBy?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationAction {
  id: string;
  type: ActionType;
  data: any;
  automation: Automation;
  nextAction: AutomationAction;
  createdAt: Date;
  updatedAt: Date;
}
