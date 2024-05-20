import {
    EventSubscriber,
    EntitySubscriberInterface,
    InsertEvent,
    Connection,
} from "typeorm";
import { Card } from "./card.entity";
import { Injectable } from "@nestjs/common";
import {
    ActivityType,
    CardActivity,
} from "./card-activities/card.activity.entity";

@Injectable()
@EventSubscriber()
export class CardSubscriber implements EntitySubscriberInterface<Card> {
    constructor(connection: Connection) {
        connection.subscribers.push(this);
    }
    /**
     * Indicates that this subscriber only listen to Card events.
     */
    listenTo() {
        return Card;
    }

    /**
     * Called after card insertion.
     */
    afterInsert(event: InsertEvent<Card>) {
        const activityRepo = event.manager.getRepository(CardActivity);

        const activity = activityRepo.create({
            type: ActivityType.UPDATE,
            card: event.entity,
            content: {
                text: "created this task",
            },
            createdBy: event.entity.createdBy,
        });
        activityRepo.save(activity);
    }
}
