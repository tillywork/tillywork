import type { List } from '../lists/types';

export interface Space {
  id: number;
  icon: string;
  iconColor: string;
  name: string;
  workspaceId: number;
  lists: List[];
}
