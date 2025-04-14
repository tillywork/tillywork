import { Injectable } from "@nestjs/common";

import { Card } from "../../../cards/card.entity";
import {
    AutomationContext,
    BaseAutomationHandler,
} from "../automation.handler";

import {
    ActionType,
    AutomationFieldSchema,
    Field,
    FieldTypes,
    GetHandlerFieldsParams,
    normalizeFieldValue,
} from "@tillywork/shared";

export type ChangeAssigneePayload = {
    add: number[];
    remove: number[];
};

@Injectable()
export class ChangeAssigneeHandler extends BaseAutomationHandler {
    constructor() {
        super({
            metadata: {
                icon: "mdi-text-box-edit-outline",
                title: "Change assignee",
                section: "Collaboration",
                value: ActionType.CHANGE_ASSIGNEE,
            },
        });
    }

    async execute(
        payload: ChangeAssigneePayload,
        context: AutomationContext
    ): Promise<Card> {
        const { card, automation } = context;

        const fields = await this.getCardFields(automation.id);
        const assigneeField = fields.find((field) => field.isAssignee);

        let newAssigneeValue: number[] =
            card.data[assigneeField.slug]?.map((userId) => +userId) ?? [];

        newAssigneeValue = newAssigneeValue.filter(
            (userId) => !payload.remove?.includes(userId)
        );

        if (payload.add) {
            for (const userIdToAdd of payload.add) {
                const isAlreadyAssigned = newAssigneeValue.find(
                    (userId) => userId === userIdToAdd
                );
                if (!isAlreadyAssigned) {
                    newAssigneeValue.push(userIdToAdd);
                }
            }
        }

        if (payload.remove) {
            for (const userIdToRemove of payload.remove) {
                const userIdIndex = newAssigneeValue.findIndex(
                    (userId) => userId === userIdToRemove
                );

                if (userIdIndex > -1) {
                    newAssigneeValue.slice(userIdIndex, 1);
                }
            }
        }

        const newValue = normalizeFieldValue({
            v: newAssigneeValue,
            field: assigneeField as unknown as Field,
        });

        const updatedCard = await this.aclContext.run(true, () =>
            this.cardsService.update(card.id, {
                ...card,
                data: {
                    ...card.data,
                    [assigneeField.slug]: newValue ?? null,
                },
            })
        );

        return updatedCard;
    }

    async getFields(
        params: GetHandlerFieldsParams
    ): Promise<Record<string, AutomationFieldSchema>> {
        const automation = await this.automationsService.findOne(
            params.automationId
        );

        const users = await this.getListUsersAsFieldOptions({
            automation,
        });

        const stepFields: Record<string, AutomationFieldSchema> = {
            add: {
                title: "Add assignee",
                type: FieldTypes.USER,
                options: users,
                multiple: true,
            },
            remove: {
                title: "Remove assignee",
                type: FieldTypes.USER,
                options: users,
                multiple: true,
            },
        };

        return stepFields;
    }
}
