import { FieldTypes, Automation, ActionType, TriggerType } from '../..';

export enum AutomationStepType {
  TRIGGER = 'trigger',
  ACTION = 'action',
}

export interface AutomationStep {
  id: string;
  type: AutomationStepType;
  value?: ActionType | TriggerType;
  data: Record<string, any>;
  automation: Automation;
  nextStep?: AutomationStep;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationFieldSchema {
  title: string;
  type: FieldTypes;
  required?: boolean;
  description?: string;
  multiple?: boolean;
  options?: AutomationFieldOption[];
  refreshers?: string[];
  allowDynamicValues?: boolean;
}

export interface AutomationFieldOption {
  title: string;
  value: any;
  icon?: string;
  photo?: string;
  avatar?: boolean;
}

export interface AutomationHandlerMetadata {
  icon: string;
  title: string;
  section: string;
  description?: string;
  value: ActionType | TriggerType;
  sampleData?: Record<string, any>;
}

export interface AutomationHandlerDefinition {
  metadata: AutomationHandlerMetadata;
  fields?: Record<string, AutomationFieldSchema>;
}
