import { Injectable } from "@nestjs/common";
import {
    Connection,
    EventSubscriber,
    EntitySubscriberInterface,
    UpdateEvent,
    RemoveEvent,
} from "typeorm";
import { ListStage } from "./list.stage.entity";
import { ListGroup } from "../list-groups/list.group.entity";
import { ListGroupEntityTypes, ListGroupOptions } from "../types";

@Injectable()
@EventSubscriber()
export class ListStagesSubscriber
    implements EntitySubscriberInterface<ListStage>
{
    constructor(connection: Connection) {
        connection.subscribers.push(this);
    }

    listenTo() {
        return ListStage;
    }

    async afterUpdate(event: UpdateEvent<ListStage>) {
        const listGroupRepo = event.manager.getRepository(ListGroup);
        const listGroup = await listGroupRepo.findOneBy({
            entityType: ListGroupEntityTypes.LIST_STAGE,
            type: ListGroupOptions.LIST_STAGE,
            entityId: event.entity.id,
            listId: event.entity.listId,
        });
        listGroupRepo.merge(listGroup, {
            name: event.entity.name,
            color: event.entity.color,
            order: event.entity.order,
        });
        listGroupRepo.save(listGroup);
    }

    async afterRemove(event: RemoveEvent<ListStage>) {
        const listGroupRepo = event.manager.getRepository(ListGroup);
        const listGroup = await listGroupRepo.findOneBy({
            entityType: ListGroupEntityTypes.LIST_STAGE,
            type: ListGroupOptions.LIST_STAGE,
            entityId: event.entity.id,
            listId: event.entity.listId,
        });
        listGroupRepo.remove(listGroup);
    }
}
