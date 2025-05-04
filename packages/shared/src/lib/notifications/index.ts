import { User, Workspace } from '../..';

export enum NotificationType {
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  SUBSCRIPTION = 'subscription',
  MENTION = 'mention',
  COMMENT = 'comment',
  ASSIGNED = 'assigned',
  UNASSIGNED = 'unassigned',
  STAGE_UPDATED = 'stage_updated',
  AUTOMATION = 'automation',
}

export enum WatchableResourceType {
  CARD = 'card',
  LIST = 'list',
}

export type Notification = {
  id: string;
  type: NotificationType;
  recepient: User;
  workspace: Workspace;
  relatedResourceId?: string;
  relatedResourceType?: string;
  color?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export enum NotificationChannel {
  IN_APP = 'in_app',
  SLACK = 'slack',
  EMAIL = 'email',
}

export type NotificationPreference = {
  id: string;
  channel: NotificationChannel;
  user: User;
  enabled: boolean;
  config: PreferenceConfig;
  createdAt: string;
  updatedAt: string;
};

export type PreferenceConfig = SlackNotificationConfig;

export type SlackNotificationConfig = {
  isDmEnabled?: boolean;
  channelId?: string;
};
