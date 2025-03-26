import { Injectable } from "@nestjs/common";

import { BaseAutomationHandler } from "../automation.handler";

import {
    ActionType,
    AutomationFieldSchema,
    GetHandlerFieldsParams,
} from "@tillywork/shared";
import { getSampleDataByField } from "../../helpers/sample.data.helper";

@Injectable()
export class CreateCardHandler extends BaseAutomationHandler {
    constructor() {
        super({
            metadata: {
                title: "Create a card",
                icon: "mdi-card-plus",
                section: "Card management",
                value: ActionType.CREATE_CARD,
            },
        });
    }

    async execute(payload: any): Promise<any> {
        return payload;
    }

    async getFields(
        params: GetHandlerFieldsParams
    ): Promise<Record<string, AutomationFieldSchema>> {
        const fields = await this.getCardFields(params.automationId);

        const handlerFields: Record<string, AutomationFieldSchema> = {};
        for (const field of fields) {
            handlerFields[field.slug] = {
                title: field.name,
                type: field.type,
                options: field.items?.map((item) => ({
                    title: item.item,
                    value: item.item,
                })),
            };
        }

        return handlerFields;
    }

    async getSampleData(automationId: string): Promise<Record<string, any>> {
        const fields = await this.getCardFields(automationId);
        const sampleData: Record<string, any> = {};

        for (const field of fields) {
            sampleData[field.slug] = getSampleDataByField(field);
        }

        return sampleData;
    }
}
