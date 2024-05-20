/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    EventSubscriber,
    EntitySubscriberInterface,
    InsertEvent,
    Connection,
    RemoveEvent,
} from "typeorm";
import { Injectable } from "@nestjs/common";
import { User } from "../users/user.entity";
import {
    ActivityType,
    CardActivity,
} from "../card-activities/card.activity.entity";
import { ClsService } from "nestjs-cls";

@Injectable()
@EventSubscriber()
export class CardUserSubscriber implements EntitySubscriberInterface<any> {
    constructor(connection: Connection, private clsService: ClsService) {
        connection.subscribers.push(this);
    }
    /**
     * Indicates that this subscriber only listen to card_users events.
     */
    listenTo() {
        return "card_users";
    }

    async afterInsert(event: InsertEvent<any>) {
        const activityRepo = event.manager.getRepository(CardActivity);
        const userRepo = event.manager.getRepository(User);
        const user = await userRepo.findOne({
            where: {
                id: event.entityId.userId,
            },
        });
        const createdBy = this.clsService.get("user");
        const activity = activityRepo.create({
            type: ActivityType.UPDATE,
            card: {
                id: event.entityId.cardId,
            },
            content: {
                text: `assigned ${user.firstName} ${user.lastName}`,
            },
            createdBy: {
                id: createdBy.id,
            },
        });
        activityRepo.save(activity);
    }

    async afterRemove(event: RemoveEvent<any>) {
        const activityRepo = event.manager.getRepository(CardActivity);
        const userRepo = event.manager.getRepository(User);
        const user = await userRepo.findOne({
            where: {
                id: event.entityId.userId,
            },
        });
        const createdBy = this.clsService.get("user");
        const activity = activityRepo.create({
            type: ActivityType.UPDATE,
            card: {
                id: event.entityId.cardId,
            },
            content: {
                text: `unassigned ${user.firstName} ${user.lastName}`,
            },
            createdBy: {
                id: createdBy.id,
            },
        });
        activityRepo.save(activity);
    }
}
