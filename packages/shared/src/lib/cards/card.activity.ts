import { User, Card, FieldTypes } from '../..';

export enum ActivityType {
  UPDATE = 'UPDATE',
  COMMENT = 'COMMENT',
}

export interface CardActivity {
  id: number;
  card: Card;
  type: ActivityType;
  content: ActivityContent;
  createdAt: Date;
  createdBy: User;
}

interface BaseActivityContent {
  description?: string;
}

export interface CommentActivityContent extends BaseActivityContent {
  content: TiptapContent;
}

export interface UpdateActivityContent extends BaseActivityContent {
  changes: FieldChange[];
}

export interface EmailActivityContent extends BaseActivityContent {
  subject: string;
  body: string;
  recipient: string;
}

export interface TaskActivityContent extends BaseActivityContent {
  title: string;
  dueDate?: Date;
  status: 'pending' | 'completed' | 'in_progress';
}

export interface CallActivityContent extends BaseActivityContent {
  duration: number;
  phoneNumber: string;
  outcome?: string;
}

export interface MessageActivityContent extends BaseActivityContent {
  text: string;
  channel: 'sms' | 'whatsapp' | 'slack' | 'other';
}

export interface MeetingActivityContent extends BaseActivityContent {
  title: string;
  startTime: Date;
  endTime: Date;
  participants: string[];
  location?: string;
  meetingLink?: string;
}

export type ActivityContent =
  | CommentActivityContent
  | UpdateActivityContent
  | EmailActivityContent
  | TaskActivityContent
  | CallActivityContent
  | MessageActivityContent
  | MeetingActivityContent;

export interface TiptapContent {
  type: string;
  content?: TiptapContent[];
  text?: string;
  marks?: Array<{
    type: string;
    attrs?: Record<string, any>;
  }>;
}

export interface FieldChange {
  field?: {
    id: number;
    slug: string;
  };
  type: 'created' | 'updated' | 'stage_updated';
  oldValue?: any;
  newValue?: any;

  addedItems?: any[];
  removedItems?: any[];
}

export const ACTIVITY_FIELD_TYPES = [
  FieldTypes.CARD,
  FieldTypes.DROPDOWN,
  FieldTypes.LABEL,
  FieldTypes.USER,
];
