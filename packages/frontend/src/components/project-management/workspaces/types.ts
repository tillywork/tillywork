import type { CardType } from '../cards/types';
import type { Space } from '../spaces/types';

export interface Workspace {
  id: number;
  name: string;
  ownerId: number;
  projectId: number;
  type: WorkspaceTypes;
  defaultCardType: CardType;
  spaces: Space[];
  cardTypes: CardType[];
  createdAt: string;
  updatedAt: string;
}

export enum WorkspaceTypes {
  CRM = 'crm',
  PROJECT_MANAGEMENT = 'project_management',
  AGILE_PROJECTS = 'agile_projects',
}
