import {
    EventSubscriber,
    EntitySubscriberInterface,
    Connection,
    UpdateEvent,
    InsertEvent,
} from "typeorm";
import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CardActivity } from "./card.activity.entity";
import { TriggerEvent } from "../../automations/events/trigger.event";
import { ActivityType, getNewMentions, TriggerType } from "@tillywork/shared";
import { NotificationCommentEvent } from "../../notifications/events/comment.event";
import { TillyLogger } from "../../logger/tilly.logger";

@Injectable()
@EventSubscriber()
export class CardActivitySubscriber
    implements EntitySubscriberInterface<CardActivity>
{
    private readonly logger = new TillyLogger("CardActivitySubscriber");

    constructor(connection: Connection, private eventEmitter: EventEmitter2) {
        connection.subscribers.push(this);
    }

    listenTo() {
        return CardActivity;
    }

    async afterInsert(event: InsertEvent<CardActivity>) {
        if (event.entity.type === ActivityType.COMMENT) {
            this.eventEmitter.emit(
                "automation.trigger",
                new TriggerEvent(
                    TriggerType.COMMENT_CREATED,
                    event.entity.card.id,
                    event.entity
                )
            );

            const mentionedUserIds = getNewMentions(event.entity.content);

            this.eventEmitter.emit(
                "notification.comment",
                new NotificationCommentEvent({
                    cardId: event.entity.card.id,
                    comment: event.entity,
                    mentionedUserIds,
                })
            );
        }
    }

    async afterUpdate(event: UpdateEvent<CardActivity>) {
        //
    }
}
