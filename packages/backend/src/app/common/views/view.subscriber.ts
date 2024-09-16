import {
    EventSubscriber,
    EntitySubscriberInterface,
    Connection,
    LoadEvent,
    InsertEvent,
} from "typeorm";
import { Injectable } from "@nestjs/common";
import { Filter } from "../filters/filter.entity";
import { View } from "./view.entity";
import { FilterEntityTypes } from "../filters/types";
import { List } from "../lists/list.entity";
import { Field } from "../fields/field.entity";
import { ViewTypes } from "@tillywork/shared";

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

    async afterInsert(event: InsertEvent<View>): Promise<View | void> {
        /**
         * If the view is a table view,
         * we need to set the default columns from
         * the title field,
         * the pinned fields of both the
         * list default card type fields
         * and the list fields.
         */
        if (event.entity.type === ViewTypes.TABLE) {
            const listsRepo = event.manager.getRepository(List);
            const fieldsRepo = event.manager.getRepository(Field);

            const list = await listsRepo.findOneBy({
                id: event.entity.listId,
            });

            const listFields = await fieldsRepo.findBy({
                lists: {
                    id: list.id,
                },
            });

            const cardTypeFields = await fieldsRepo.findBy({
                cardType: {
                    id: list.defaultCardType.id,
                },
            });

            const titleField: Field = cardTypeFields.find(
                (field) => field.isTitle
            );
            const pinnedFields: Field[] = [
                ...listFields.filter((field) => field.isPinned),
                ...cardTypeFields.filter((field) => field.isPinned),
            ];

            event.entity.options.columns = [
                titleField.id.toString(),
                ...pinnedFields.map((field) => field.id.toString()),
            ];

            // Save the updated entity
            await event.manager.save(event.entity);
        }
    }
}
