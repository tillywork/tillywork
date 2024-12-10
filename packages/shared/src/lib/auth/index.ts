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
