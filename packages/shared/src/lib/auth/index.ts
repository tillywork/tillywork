export enum PermissionLevel {
  // No access at all
  NONE = 'none',

  // Can view content but cannot make any changes
  VIEWER = 'viewer',

  // Can make edits to content
  EDITOR = 'editor',

  // Full control, including sharing and deletion
  OWNER = 'owner',
}
