import type { User } from '../users/types';
import type { Workspace } from '@/components/project-management/workspaces/types';
import type { List } from '@/components/project-management/lists/types';
import type { Card } from '@/components/project-management/cards/types';

export interface Project {
  id: number;
  name: string;
  ownerId: string;
  users: ProjectUser[];
  inviteCode?: string;
}

export interface ProjectUser {
  id: number;
  role: string;
  user: User;
  project: Project;
  inviteCode?: string;
}

export const projectUserActivityTypes = ['ENTITY', 'SETTING'] as const;
export type ProjectUserActivityTypes =
  (typeof projectUserActivityTypes)[number];

export type ProjectUserActivityEntity = List | Card;

export const projectUserActivityEntityTypes = ['LIST', 'CARD'] as const;
export type ProjectUserActivityEntityTypes =
  (typeof projectUserActivityEntityTypes)[number];

export interface ProjectUserActivity {
  id: string;
  projectUser: ProjectUser;
  projectUserId: number;
  workspace: Workspace;
  workspaceId: number;
  type: ProjectUserActivityTypes;
  entityId: number;
  entityType: ProjectUserActivityEntityTypes;
}

type CreateProjectUserActivityEntityDTO = {
  type: 'ENTITY';
  entityId: number;
  entityType: ProjectUserActivityEntityTypes;
};
type CreateProjectUserActivitySettingDTO = {
  type: 'SETTING';
  name: string;
  path: string;
};

export type CreateProjectUserActivityDTO =
  | CreateProjectUserActivityEntityDTO
  | CreateProjectUserActivitySettingDTO;
