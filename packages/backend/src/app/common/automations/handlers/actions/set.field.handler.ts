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

export type SetFieldPayload = Record<string, any>;

@Injectable()
export class SetFieldHandler extends BaseAutomationHandler {
    constructor() {
        super({
            metadata: {
                icon: "mdi-pencil-circle",
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
        const { card, automation } = context;
        const fields = await this.getCardFields(automation.id);

        const normalizedPayload: SetFieldPayload = {};

        for (const key of Object.keys(payload)) {
            const updatedField = fields.find((f) => f.slug === key);

            if (updatedField) {
                normalizedPayload[key] = normalizeFieldValue({
                    v: payload[key],
                    field: updatedField as unknown as Field,
                });
            }
        }

        const mergedData = this.mergeCardData(card.data, normalizedPayload);
        const updatedCard = await this.aclContext.run(true, () =>
            this.cardsService.update(card.id, {
                data: mergedData,
            })
        );
        return updatedCard;
    }

    async getFields(
        params: GetHandlerFieldsParams
    ): Promise<Record<string, AutomationFieldSchema>> {
        const fields = await this.getCardFields(params.automationId);
        const automation = await this.automationsService.findOne(
            params.automationId
        );

        const stepFields: Record<string, AutomationFieldSchema> = {
            field: {
                title: "Field to update",
                type: FieldTypes.DROPDOWN,
                required: true,
                options: fields.map((field) => ({
                    title: field.name,
                    value: field.slug,
                })),
                refreshers: [],
            },
        };

        if (params.data.field) {
            const selectedField = fields.find(
                (f) => f.slug === params.data.field
            );

            let options = [];
            switch (selectedField.type) {
                case FieldTypes.USER:
                    options = await this.getListUsersAsFieldOptions({
                        automation,
                    });
                    break;
                default:
                    options = selectedField.items?.map((item) => ({
                        title: item.item,
                        value: item.item,
                    }));
            }
            stepFields[selectedField.slug] = {
                title: selectedField.name,
                type: selectedField.type,
                options,
            };
        }

        return stepFields;
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
