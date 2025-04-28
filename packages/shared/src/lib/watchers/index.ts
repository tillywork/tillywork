import { User, WatchableResourceType } from '../..';

export type Watcher = {
  id: string;
  user: User;
  resourceId: number;
  resourceType: WatchableResourceType;
  createdAt: string;
  updatedAt: string;
};

export type CreateWatcherDto = {
  resourceId: number;
  resourceType: WatchableResourceType;
  userId: number;
};
