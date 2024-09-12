import {
    EventSubscriber,
    EntitySubscriberInterface,
    InsertEvent,
    Connection,
} from "typeorm";
import { Injectable } from "@nestjs/common";
import { CardType } from "./card.type.entity";
import { Field } from "../fields/field.entity";
import { FieldTypes } from "../fields/types";

@Injectable()
@EventSubscriber()
export class CardTypeSubscriber implements EntitySubscriberInterface<CardType> {
    constructor(connection: Connection) {
        connection.subscribers.push(this);
    }

    listenTo() {
        return CardType;
    }

    async afterInsert(event: InsertEvent<CardType>) {
        const fieldRepo = event.manager.getRepository(Field);

        const defaultFields = [
            {
                name: "Title",
                slug: "title",
                type: FieldTypes.RICH,
                isTitle: true,
                icon: "mdi-text-recognition",
                required: true,
            },
            {
                name: "Description",
                type: FieldTypes.RICH,
                slug: "description",
                icon: "mdi-text-box",
            },
            {
                name: "Assignee",
                type: FieldTypes.USER,
                slug: "assignee",
                icon: "mdi-account",
                isPinned: true,
                isAssignee: true,
            },
            {
                name: "Due At",
                type: FieldTypes.DATE,
                slug: "due_at",
                icon: "mdi-calendar",
                isPinned: true,
            },
            {
                name: "Starts At",
                type: FieldTypes.DATE,
                slug: "starts_at",
                icon: "mdi-calendar",
            },
        ];

        defaultFields.forEach(async (field) => {
            const fieldEntity = fieldRepo.create({
                ...field,
                workspace: event.entity.workspace,
                cardType: {
                    id: event.entity.id,
                },
            });

            await fieldRepo.save(fieldEntity);
        });
    }
}
