import { List } from '../lists';

export interface Space {
  id: number;
  icon: string;
  iconColor: string;
  name: string;
  workspaceId: number;
  lists: List[];
}
