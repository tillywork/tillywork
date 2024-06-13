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
import { CardType } from "../card-types/card.type.entity";

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
    async afterInsert(event: InsertEvent<Card>) {
        const activityRepo = event.manager.getRepository(CardActivity);
        const cardTypeRepo = event.manager.getRepository(CardType);

        const cardType = await cardTypeRepo.findOneBy({
            id: event.entity.type.id,
        });

        const activity = activityRepo.create({
            type: ActivityType.UPDATE,
            card: event.entity,
            content: {
                text: "created this " + cardType.name.toLocaleLowerCase(),
            },
            createdBy: event.entity.createdBy,
        });
        activityRepo.save(activity);
    }
}
