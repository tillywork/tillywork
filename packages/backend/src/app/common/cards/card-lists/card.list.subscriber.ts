import {
    EventSubscriber,
    EntitySubscriberInterface,
    Connection,
    UpdateEvent,
    InsertEvent,
} from "typeorm";
import { Injectable, Logger } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import { CardList } from "./card.list.entity";
import { ActivityType, TriggerType } from "@tillywork/shared";
import { CardActivity } from "../card-activities/card.activity.entity";
import { ListStage } from "../../lists/list-stages/list.stage.entity";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { TriggerEvent } from "../../automations/events/trigger.event";

@Injectable()
@EventSubscriber()
export class CardListSubscriber implements EntitySubscriberInterface<CardList> {
    private readonly logger = new Logger("CardListSubscriber");

    constructor(
        connection: Connection,
        private clsService: ClsService,
        private eventEmitter: EventEmitter2
    ) {
        connection.subscribers.push(this);
    }

    listenTo() {
        return CardList;
    }

    async afterInsert(event: InsertEvent<CardList>) {
        const user = this.clsService.get("user");

        const activityRepo = event.manager.getRepository(CardActivity);
        const listStageRepo = event.manager.getRepository(ListStage);

        if (!event.entity.listStage?.id) {
            return;
        }

        const listStage = await listStageRepo.findOne({
            where: {
                id: event.entity.listStage.id,
            },
        });

        if (listStage.order > 1) {
            const activity = activityRepo.create({
                type: ActivityType.UPDATE,
                card: {
                    id: event.entity.card.id,
                },
                content: {
                    changes: [
                        {
                            type: "stage_updated",
                            newValue: event.entity.listStageId,
                        },
                    ],
                },
                createdBy: { id: user.id },
            });
            await activityRepo.save(activity);
        }
    }

    async afterUpdate(event: UpdateEvent<CardList>) {
        const user = this.clsService.get("user");
        this.logger.debug({ user });

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

        const change = {
            type: "stage_updated",
            oldValue: +event.databaseEntity.listStageId,
            newValue: +event.entity.listStageId,
        };

        this.eventEmitter.emit(
            "automation.trigger",
            new TriggerEvent(
                TriggerType.STAGE_CHANGED,
                cardList.card as unknown as number,
                change
            )
        );

        const activity = activityRepo.create({
            type: ActivityType.UPDATE,
            card: {
                id: cardList.card as unknown as number,
            },
            content: {
                changes: [change],
            },
            createdBy: { id: user.id },
            createdByType: "user",
        });
        await activityRepo.save(activity);
    }
}
