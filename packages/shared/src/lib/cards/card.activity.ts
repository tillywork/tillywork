import { User, Card, FieldTypes } from '../..';

export enum ActivityType {
  UPDATE = 'update',
  COMMENT = 'comment',
  EMAIL = 'email',
  TASK = 'task',
  CALL = 'call',
  MESSAGE = 'message',
  MEETING = 'meeting',
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
  description?: TiptapContent;
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
  isCompleted: boolean;
}

export type TaskActivityStatus = 'pending' | 'in_progress' | 'completed';

export interface TaskActivityContent extends BaseActivityContent {
  title: string;
  dueDate?: string;
  status: TaskActivityStatus;
  isCompleted: boolean;
  assignee?: number[];
}

export interface CallActivityContent extends BaseActivityContent {
  duration: number;
  phoneNumber: string;
  outcome?: string;
  isCompleted: boolean;
}

export interface MessageActivityContent extends BaseActivityContent {
  channel: 'sms' | 'whatsapp' | 'slack' | 'other';
  isCompleted: boolean;
}

export interface MeetingActivityContent extends BaseActivityContent {
  title: string;
  startTime: Date;
  endTime: Date;
  participants: string[];
  location?: string;
  meetingLink?: string;
  isCompleted: boolean;
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
  attrs?: Record<string, any>;
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

export const TASK_STATUS_OPTIONS = [
  {
    title: 'Pending',
    value: 'pending',
    color: 'default',
  },
  {
    title: 'In Progress',
    value: 'in_progress',
    color: 'primary',
  },
  {
    title: 'Completed',
    value: 'completed',
    color: 'success',
  },
];
