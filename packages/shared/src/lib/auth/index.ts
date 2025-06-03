import { List, Project, Space, User, Workspace } from '../..';

export enum PermissionLevel {
  /** No access at all */
  NONE = 'none',

  /** Can view content but cannot make any changes */
  VIEWER = 'viewer',

  /** Can make edits to content */
  EDITOR = 'editor',

  /** Full control */
  OWNER = 'owner',
}

export enum AccessType {
  /** All users in project have access */
  PUBLIC = 'public',

  /** Only owner and users shared to entity have access */
  PRIVATE = 'private',

  /** Only the owner has access */
  ONLY_ME = 'only_me',
}

export type AccessControlResourceType =
  | 'project'
  | 'workspace'
  | 'space'
  | 'list';

export type AccessControl = {
  id: number;
  permissionLevel: PermissionLevel;
  user: User;
  project?: Project;
  workspace?: Workspace;
  space?: Space;
  list?: List;
  createdAt: string;
};

export const PERMISSION_LEVEL_ORDER = [
  PermissionLevel.NONE,
  PermissionLevel.VIEWER,
  PermissionLevel.EDITOR,
  PermissionLevel.OWNER,
];
