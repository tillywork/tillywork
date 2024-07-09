import type { List } from '../lists/types';

export interface Space {
  id: number;
  icon: string;
  name: string;
  workspaceId: number;
  lists: List[];
}
