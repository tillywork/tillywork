import type { Space } from '../spaces/types';

export interface Workspace {
  id: number;
  name: string;
  ownerId: number;
  projectId: number;
  type: WorkspaceTypes;
  spaces: Space[];
  createdAt: string;
  updatedAt: string;
}

export enum WorkspaceTypes {
  CRM = 'crm',
  PROJECT_MANAGEMENT = 'project_mangement',
  AGILE_PROJECTS = 'agile_projects',
}
