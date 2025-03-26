import {
  CreatedByType,
  List,
  LocationType,
  Space,
  User,
  Workspace,
  AutomationStep,
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
