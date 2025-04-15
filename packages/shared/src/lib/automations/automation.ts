import {
  CreatedByType,
  List,
  LocationType,
  Space,
  User,
  Workspace,
  AutomationStep,
  ActionType,
  TriggerType,
  AutomationStepType,
} from '../..';

export type Automation = {
  id: string;
  name: string;
  isEnabled: boolean;
  trigger: AutomationStep;
  steps: AutomationStep[];
  locations: AutomationLocation[];
  lists?: List[];
  spaces?: Space[];
  workspace: Workspace;
  createdByType: CreatedByType;
  createdBy?: User;
  createdAt: Date;
  updatedAt: Date;
};

export type AutomationLocation = {
  id: string;
  locationId: number;
  locationType: LocationType;
  automation: Automation;
  location: Space | List;
};

export type CreateAutomationDto = {
  name: string;
  workspaceId: number;
  locations?: CreateAutomationLocationDto[];
  trigger: Partial<AutomationStep>;
};

export type CreateAutomationLocationDto = {
  locationId: number;
  locationType: LocationType;
  automationId?: string;
};

export type ValidateStepParams = {
  type: AutomationStepType;
  value?: ActionType | TriggerType;
  data: Record<string, any>;
  automationId: string;
};

export type AutomationValidationResponse = {
  isValid: boolean;
  message?: string;
};
