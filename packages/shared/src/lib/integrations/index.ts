import { User } from '../users';

export * from './slack';

export enum IntegrationType {
  SLACK = 'slack',
}

export type UserIntegration = {
  id: string;
  user: User;
  type: IntegrationType;
  config: UserIntegrationConfig;
  createdAt: string;
  updatedAt: string;
};

export type UserIntegrationConfig = SlackIntegrationConfig;

export type SlackIntegrationConfig = {
  accessToken: string;
  slackUserId: string;
};
