import type { List } from '../lists/types';

export interface Space {
  id: number;
  name: string;
  workspaceId: number;
  lists: List[];
}
