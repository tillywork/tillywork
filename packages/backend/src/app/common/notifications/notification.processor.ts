import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { AclContext } from "../auth/context/acl.context";
import { CardsService } from "../cards/cards.service";
import { ListStagesService } from "../lists/list-stages/list.stages.service";
import { UsersService } from "../users/users.service";
import { WatcherService } from "../watchers/watcher.service";
import { NotificationAssigneeEvent } from "./events/assignee.event";
import { NotificationCommentEvent } from "./events/comment.event";
import { NotificationMentionEvent } from "./events/mention.event";
import { NotificationStageUpdatedEvent } from "./events/stage.updated.event";
import { NotificationService } from "./notification.service";
import {
    getCreatedByName,
    NotificationType,
    WatchableResourceType,
} from "@tillywork/shared";
import { NotificationEvent } from "./events/notification.event";
import { NotificationPreferenceService } from "./notification-preference/notification.preference.service";

@Processor("notifications")
export class NotificationProcessor {
    constructor(
        private readonly watcherService: WatcherService,
        private readonly notificationService: NotificationService,
        private readonly cardsService: CardsService,
        private readonly aclContext: AclContext,
        private readonly usersService: UsersService,
        private readonly listStagesService: ListStagesService,
        private readonly notificationPreferenceService: NotificationPreferenceService
    ) {}

    @Process("notify")
    async handleNotificationJob(
        job: Job<{ type: NotificationType; event: NotificationEvent }>
    ) {
        const { type, event } = job.data;

        switch (type) {
            case NotificationType.ASSIGNMENT:
                await this.handleAssigneeEvent(
                    event as NotificationAssigneeEvent
                );
                break;

            case NotificationType.COMMENT:
                await this.handleCommentEvent(
                    event as NotificationCommentEvent
                );
                break;

            case NotificationType.MENTION:
                await this.handleMentionEvent(
                    event as NotificationMentionEvent
                );
                break;

            case NotificationType.STAGE_UPDATED:
                await this.handleStageUpdatedEvent(
                    event as NotificationStageUpdatedEvent
                );
                break;

            default:
                throw new Error(`Unknown event type: ${type}`);
        }
    }

    private async handleAssigneeEvent(event: NotificationAssigneeEvent) {
        const { createdById, workspaceId, cardId, assigneeChange } =
            event.payload;

        const addedAssignees = assigneeChange.newValue.filter(
            (id) => !assigneeChange.oldValue.includes(id)
        );
        const removedAssignees = assigneeChange.oldValue.filter(
            (id) => !assigneeChange.newValue.includes(id)
        );

        for (const userId of addedAssignees) {
            if (userId === createdById) continue;

            await this.watcherService.addWatcher({
                userId,
                resourceType: WatchableResourceType.CARD,
                resourceId: cardId,
            });

            if (
                await this.notificationPreferenceService.isInAppEnabled(userId)
            ) {
                await this.notificationService.create({
                    type: NotificationType.ASSIGNMENT,
                    recipientId: userId,
                    workspaceId,
                    relatedResourceId: cardId.toString(),
                    relatedResourceType: "card",
                    message: `You were added as assignee`,
                });
            }
        }

        for (const userId of removedAssignees) {
            if (userId === createdById) continue;

            if (
                await this.notificationPreferenceService.isInAppEnabled(userId)
            ) {
                await this.notificationService.create({
                    type: NotificationType.ASSIGNMENT,
                    recipientId: userId,
                    workspaceId,
                    relatedResourceId: cardId.toString(),
                    relatedResourceType: "card",
                    message: `You were removed as assignee`,
                });
            }
        }
    }

    private async handleCommentEvent(event: NotificationCommentEvent) {
        const { cardId, comment, mentionedUserIds } = event.payload;

        const card = await this.aclContext.run(true, () =>
            this.cardsService.findOne(cardId)
        );

        const commenter = await this.aclContext.run(true, () => {
            if (comment.createdBy) {
                return this.usersService.findOne(comment.createdBy?.id);
            }

            return null;
        });

        if (commenter) {
            await this.watcherService.addWatcher({
                userId: commenter.id,
                resourceId: card.id,
                resourceType: WatchableResourceType.CARD,
            });
        }

        const watchers = await this.watcherService.findWatchers({
            resourceId: cardId,
            resourceType: WatchableResourceType.CARD,
        });

        for (const userId of mentionedUserIds) {
            if (userId === commenter?.id) continue;

            await this.watcherService.addWatcher({
                userId,
                resourceId: cardId,
                resourceType: WatchableResourceType.CARD,
            });

            if (
                await this.notificationPreferenceService.isInAppEnabled(userId)
            ) {
                await this.notificationService.create({
                    type: NotificationType.MENTION,
                    recipientId: userId,
                    workspaceId: card.workspaceId,
                    relatedResourceId: cardId.toString(),
                    relatedResourceType: "card",
                    message: `${getCreatedByName({
                        createdBy: commenter as any,
                        createdByType: comment.createdByType,
                    })} mentioned you in a comment`,
                });
            }
        }

        for (const watcher of watchers) {
            if (
                watcher.id === comment.createdBy?.id ||
                mentionedUserIds.includes(watcher.id)
            )
                continue;

            if (
                await this.notificationPreferenceService.isInAppEnabled(
                    watcher.id
                )
            ) {
                await this.notificationService.create({
                    type: NotificationType.COMMENT,
                    recipientId: watcher.id,
                    workspaceId: card.workspaceId,
                    relatedResourceId: cardId.toString(),
                    relatedResourceType: "card",
                    message: `${getCreatedByName({
                        createdBy: commenter as any,
                        createdByType: comment.createdByType,
                    })} added a comment`,
                });
            }
        }
    }

    private async handleMentionEvent(event: NotificationMentionEvent) {
        const {
            createdById,
            createdByType,
            mentionedUserIds,
            cardId,
            mentionedOn,
        } = event.payload;

        const card = await this.aclContext.run(true, () =>
            this.cardsService.findOne(cardId)
        );

        const updatedBy = await this.aclContext.run(true, () => {
            if (createdById) {
                return this.usersService.findOne(createdById);
            }

            return null;
        });

        let mentionedOnName: string = mentionedOn;

        if (mentionedOn === "card") {
            mentionedOnName = card.type.name.toLowerCase();
        }

        for (const userId of mentionedUserIds) {
            if (userId === createdById) continue;

            await this.watcherService.addWatcher({
                userId,
                resourceId: cardId,
                resourceType: WatchableResourceType.CARD,
            });

            if (
                await this.notificationPreferenceService.isInAppEnabled(userId)
            ) {
                await this.notificationService.create({
                    type: NotificationType.MENTION,
                    recipientId: userId,
                    workspaceId: card.workspaceId,
                    relatedResourceId: cardId.toString(),
                    relatedResourceType: "card",
                    message: `${getCreatedByName({
                        createdBy: updatedBy as any,
                        createdByType: createdByType,
                    })} mentioned you in a ${mentionedOnName}`,
                });
            }
        }
    }

    private async handleStageUpdatedEvent(
        event: NotificationStageUpdatedEvent
    ) {
        const { activity } = event.payload;

        const card = await this.aclContext.run(true, () =>
            this.cardsService.findOne(activity.card.id)
        );

        const updatedBy = await this.aclContext.run(true, () => {
            if (activity.createdBy) {
                return this.usersService.findOne(activity.createdBy?.id);
            }

            return null;
        });

        const newListStage = await this.aclContext.run(true, () =>
            this.listStagesService.findOne(activity.content.changes[0].newValue)
        );

        const watchers = await this.watcherService.findWatchers({
            resourceId: card.id,
            resourceType: WatchableResourceType.CARD,
        });

        for (const watcher of watchers) {
            if (watcher.id === activity.createdBy?.id) continue;

            if (
                await this.notificationPreferenceService.isInAppEnabled(
                    watcher.id
                )
            ) {
                await this.notificationService.create({
                    type: NotificationType.STAGE_UPDATED,
                    recipientId: watcher.id,
                    workspaceId: card.workspaceId,
                    relatedResourceId: card.id.toString(),
                    relatedResourceType: "card",
                    color: newListStage.color,
                    message: `${getCreatedByName({
                        createdBy: updatedBy as any,
                        createdByType: activity.createdByType,
                    })} moved ${card.type.name.toLowerCase()} to ${
                        newListStage.name
                    }`,
                });
            }
        }
    }
}
