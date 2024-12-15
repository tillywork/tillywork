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
  subject?: string;
  body: string;
  to: string;
  sentAt: string;
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
  phoneNumber?: string;
  outcome: string;
  direction?: CallActivityDirection;
  calledAt: string;
}

export enum CallActivityDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum CallActivityOutcome {
  BUSY = 'busy',
  CONNECTED = 'connected',
  LEFT_LIVE_MESSAGE = 'left_live_message',
  LEFT_VOICEMAIL = 'left_voicemail',
  NO_ANSWER = 'no_answer',
  WRONG_NUMBER = 'wrong_number',
}

export enum MessageActivityChannel {
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  SLACK = 'slack',
  DISCORD = 'discord',
  OTHER = 'other',
}

export const MESSAGE_CHANNEL_OPTIONS = [
  {
    title: 'SMS',
    value: MessageActivityChannel.SMS,
    icon: 'mdi-message-text',
  },
  {
    title: 'WhatsApp',
    value: MessageActivityChannel.WHATSAPP,
    icon: 'mdi-whatsapp',
  },
  {
    title: 'Slack',
    value: MessageActivityChannel.SLACK,
    icon: 'mdi-slack',
  },
  {
    title: 'Discord',
    value: MessageActivityChannel.DISCORD,
    icon: 'mdi-message-outline',
  },
  {
    title: 'Other',
    value: MessageActivityChannel.OTHER,
    icon: 'mdi-dots-horizontal',
  },
];

export interface MessageActivityContent extends BaseActivityContent {
  channel: MessageActivityChannel;
  sentAt: string;
}

export enum MeetingActivityOutcome {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  RESCHEDULED = 'rescheduled',
  NO_SHOW = 'no_show',
  CANCELED = 'canceled',
}

export const MEETING_OUTCOME_OPTIONS = [
  {
    title: 'Scheduled',
    value: MeetingActivityOutcome.SCHEDULED,
    icon: 'mdi-calendar-clock',
  },
  {
    title: 'Completed',
    value: MeetingActivityOutcome.COMPLETED,
    icon: 'mdi-calendar-check',
  },
  {
    title: 'Rescheduled',
    value: MeetingActivityOutcome.RESCHEDULED,
    icon: 'mdi-calendar-sync',
  },
  {
    title: 'No show',
    value: MeetingActivityOutcome.NO_SHOW,
    icon: 'mdi-calendar-remove',
  },
  {
    title: 'Canceled',
    value: MeetingActivityOutcome.CANCELED,
    icon: 'mdi-calendar-minus',
  },
];

export interface MeetingActivityContent extends BaseActivityContent {
  outcome: MeetingActivityOutcome;
  meetingAt: string;
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

export const CALL_OUTCOME_OPTIONS = [
  {
    title: 'Busy',
    value: CallActivityOutcome.BUSY,
    icon: 'mdi-phone-cancel',
  },
  {
    title: 'Connected',
    value: CallActivityOutcome.CONNECTED,
    icon: 'mdi-phone-check',
  },
  {
    title: 'Left live message',
    value: CallActivityOutcome.LEFT_LIVE_MESSAGE,
    icon: 'mdi-message-text',
  },
  {
    title: 'Left voicemail',
    value: CallActivityOutcome.LEFT_VOICEMAIL,
    icon: 'mdi-voicemail',
  },
  {
    title: 'No answer',
    value: CallActivityOutcome.NO_ANSWER,
    icon: 'mdi-phone-off',
  },
  {
    title: 'Wrong number',
    value: CallActivityOutcome.WRONG_NUMBER,
    icon: 'mdi-phone-remove',
  },
];

export const CALL_DIRECTION_OPTIONS = [
  {
    title: 'Inbound',
    value: CallActivityDirection.INBOUND,
    icon: 'mdi-phone-incoming',
  },
  {
    title: 'Outbound',
    value: CallActivityDirection.OUTBOUND,
    icon: 'mdi-phone-outgoing',
  },
];
