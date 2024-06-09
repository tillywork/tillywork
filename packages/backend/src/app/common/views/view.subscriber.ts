import {
    EventSubscriber,
    EntitySubscriberInterface,
    Connection,
    LoadEvent,
} from "typeorm";
import { Injectable } from "@nestjs/common";
import { Filter } from "../filters/filter.entity";
import { View } from "./view.entity";
import { FilterEntityTypes } from "../filters/types";

@Injectable()
@EventSubscriber()
export class ViewSubscriber implements EntitySubscriberInterface<View> {
    constructor(connection: Connection) {
        connection.subscribers.push(this);
    }
    /**
     * Indicates that this subscriber only listen to View events.
     */
    listenTo() {
        return View;
    }

    async afterLoad(
        entity: View,
        event?: LoadEvent<View>
    ): Promise<View | void> {
        const filtersRepo = event.manager.getRepository(Filter);

        const filters = await filtersRepo.findOneBy({
            entityId: entity.id,
            entityType: FilterEntityTypes.VIEW,
        });

        entity.filters = filters;
    }
}
