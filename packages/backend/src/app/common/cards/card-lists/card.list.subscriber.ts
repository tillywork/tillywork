import {
    EventSubscriber,
    EntitySubscriberInterface,
    Connection,
    UpdateEvent,
} from "typeorm";
import { Injectable, Logger } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import { CardList } from "./card.list.entity";
import { ActivityType } from "@tillywork/shared";
import { CardActivity } from "../card-activities/card.activity.entity";

@Injectable()
@EventSubscriber()
export class CardListSubscriber implements EntitySubscriberInterface<CardList> {
    private readonly logger = new Logger("CardListSubscriber");

    constructor(connection: Connection, private clsService: ClsService) {
        connection.subscribers.push(this);
    }

    listenTo() {
        return CardList;
    }

    async afterUpdate(event: UpdateEvent<CardList>) {
        const user = this.clsService.get("user");

        if (
            !event.updatedColumns.some(
                (column) => column.propertyName === "listStageId"
            )
        ) {
            return;
        }

        const cardListRepo = event.manager.getRepository(CardList);
        const activityRepo = event.manager.getRepository(CardActivity);

        const cardList = await cardListRepo.findOne({
            where: {
                id: event.entity.id,
            },
            loadRelationIds: {
                relations: ["card"],
            },
        });

        const activity = activityRepo.create({
            type: ActivityType.UPDATE,
            card: {
                id: cardList.card as unknown as number,
            },
            content: {
                changes: [
                    {
                        type: "stage_updated",
                        oldValue: event.databaseEntity.listStageId,
                        newValue: event.entity.listStageId,
                    },
                ],
            },
            createdBy: { id: user.id },
        });
        await activityRepo.save(activity);
    }
}
