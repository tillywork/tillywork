import { NotificationAssigneeEvent } from "./assignee.event";
import { NotificationCommentEvent } from "./comment.event";
import { NotificationMentionEvent } from "./mention.event";
import { NotificationStageUpdatedEvent } from "./stage.updated.event";

export type NotificationEvent =
    | NotificationAssigneeEvent
    | NotificationCommentEvent
    | NotificationMentionEvent
    | NotificationStageUpdatedEvent;
