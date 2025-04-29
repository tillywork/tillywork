import { User } from '../users';

export enum IntegrationType {
  SLACK = 'slack',
}

export type UserIntegration = {
  id: string;
  user: User;
  type: IntegrationType;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};
