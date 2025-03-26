import { Injectable } from "@nestjs/common";

import { Card } from "../../../cards/card.entity";
import {
    AutomationContext,
    BaseAutomationHandler,
} from "../automation.handler";

import {
    ActionType,
    AutomationFieldSchema,
    FieldTypes,
    GetHandlerFieldsParams,
} from "@tillywork/shared";

export type SetFieldPayload = Record<string, any>;

@Injectable()
export class SetFieldHandler extends BaseAutomationHandler {
    constructor() {
        super({
            metadata: {
                icon: "mdi-text-box-edit-outline",
                title: "Set a field",
                section: "Card management",
                value: ActionType.SET_FIELD,
            },
        });
    }

    async execute(
        payload: SetFieldPayload,
        context: AutomationContext
    ): Promise<Card> {
        try {
            const { card } = context;
            this.logger.debug({ card, payload });
            const mergedData = this.mergeCardData(card.data, payload);
            const updatedCard = await this.aclContext.run(true, () =>
                this.cardsService.update(card.id, {
                    data: mergedData,
                })
            );
            return updatedCard;
        } catch (error) {
            throw new Error(error);
        }
    }

    async getFields(
        params: GetHandlerFieldsParams
    ): Promise<Record<string, AutomationFieldSchema>> {
        const fields = await this.getCardFields(params.automationId);
        const automation = await this.automationsService.findOne(
            params.automationId
        );

        const handlerFields: Record<string, AutomationFieldSchema> = {};

        for (const field of fields) {
            let options = [];
            switch (field.type) {
                case FieldTypes.USER:
                    options = await this.getListUsersAsFieldOptions({
                        automation,
                    });
                    break;
                default:
                    options = field.items?.map((item) => ({
                        title: item.item,
                        value: item.item,
                    }));
            }
            handlerFields[field.slug] = {
                title: field.name,
                type: field.type,
                options,
            };
        }

        return handlerFields;
    }

    private mergeCardData(
        existingData: Record<string, any> | null,
        newData: Record<string, any>
    ): Record<string, any> {
        return {
            ...(existingData || {}),
            ...newData,
        };
    }
}
