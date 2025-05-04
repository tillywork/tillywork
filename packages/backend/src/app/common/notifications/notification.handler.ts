import { OnEvent } from "@nestjs/event-emitter";
import { Injectable } from "@nestjs/common";
import { NotificationType } from "@tillywork/shared";
import { NotificationService } from "./notification.service";
import { TillyLogger } from "../logger/tilly.logger";
import { NotificationAssigneeEvent } from "./events/assignee.event";
import { NotificationCommentEvent } from "./events/comment.event";
import { NotificationStageUpdatedEvent } from "./events/stage.updated.event";
import { NotificationMentionEvent } from "./events/mention.event";

@Injectable()
export class NotificationHandler {
    private logger = new TillyLogger("NotificationHandler");

    constructor(private readonly notificationService: NotificationService) {}

    @OnEvent("notification.assignee")
    async handleAssigneeUpdatedEvent(event: NotificationAssigneeEvent) {
        this.notificationService.addToQueue(NotificationType.ASSIGNED, event);
    }

    @OnEvent("notification.comment")
    async handleCommentCreatedEvent(event: NotificationCommentEvent) {
        this.notificationService.addToQueue(NotificationType.COMMENT, event);
    }

    @OnEvent("notification.mention")
    async handleMentionEvent(event: NotificationMentionEvent) {
        this.notificationService.addToQueue(NotificationType.MENTION, event);
    }

    @OnEvent("notification.stage.updated")
    async handleStageUpdatedEvent(event: NotificationStageUpdatedEvent) {
        this.notificationService.addToQueue(
            NotificationType.STAGE_UPDATED,
            event
        );
    }
}
