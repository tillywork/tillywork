import { Field } from '../fields';
import { User } from '../users';
import { Workspace } from '../workspaces';

/**
 * This is where entities like Task are derived from Card entity.
 */
export type CardType = {
  id: number;
  name: string;
  workspace: Workspace;
  fields: Field[];
  createdByType: 'system' | 'user';
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCardTypeDto = {
  name: string;
  workspaceId: number;
};
