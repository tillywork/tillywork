import { Injectable } from "@nestjs/common";

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
import { Card } from "src/app/common/cards/card.entity";
import { getSampleDataByField } from "../../helpers/sample.data.helper";

@Injectable()
export class CreateSubCardHandler extends BaseAutomationHandler {
    constructor() {
        super({
            metadata: {
                title: "Create sub card",
                icon: "mdi-file-tree",
                section: "Card management",
                value: ActionType.CREATE_SUB_CARD,
            },
        });
    }

    async execute(
        payload: Record<string, any>,
        context: AutomationContext
    ): Promise<Card> {
        const { automation, card } = context;
        const fields = await this.getCardFields(automation.id);

        const normalizedPayload: Record<string, any> = {};

        for (const key of Object.keys(payload)) {
            const field = fields.find((f) => f.slug === key);

            if (field) {
                normalizedPayload[key] = normalizeFieldValue({
                    v: payload[key],
                    field: field as unknown as Field,
                });
            }
        }

        const newCard = await this.cardsService.create({
            parentId: card.id,
            data: normalizedPayload,
            listId: payload.list,
            listStageId: payload.listStage,
            type: card.type.id,
            workspaceId: card.workspaceId,
            createdByType: "automation",
        });

        return newCard;
    }

    async getFields(
        params: GetHandlerFieldsParams
    ): Promise<Record<string, AutomationFieldSchema>> {
        const fields = await this.getCardFields(params.automationId);
        const automation = await this.automationsService.findOne(
            params.automationId
        );
        const lists = await this.getAutomationLists({ automation });

        const handlerFields: Record<string, AutomationFieldSchema> = {
            list: {
                title: "List",
                type: FieldTypes.DROPDOWN,
                required: true,
                options: lists.map((l) => ({
                    title: l.name,
                    value: l.id,
                })),
            },
        };

        if (params.data.list) {
            const selectedList = lists.find((l) => l.id === params.data.list);

            if (selectedList && selectedList.listStages.length) {
                handlerFields["listStage"] = {
                    title: "List Stage",
                    type: FieldTypes.STAGE,
                    required: true,
                    options: selectedList.listStages.map((stage) => ({
                        title: stage.name,
                        value: stage.id,
                    })),
                    allowDynamicValues: true,
                };
            }
        }

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
                required: field.required,
                options,
                allowDynamicValues: true,
            };
        }

        return handlerFields;
    }

    async getSampleData(
        params: GetHandlerFieldsParams
    ): Promise<Record<string, any>> {
        const { automationId, data } = params;
        const fields = await this.getCardFields(automationId);

        const sampleData: Record<string, any> = {};

        for (const field of fields) {
            sampleData[field.slug] = getSampleDataByField(field);
            if (data.field) {
                const selectedField = fields.find((f) => f.slug === data.field);

                if (selectedField) {
                    sampleData[selectedField.slug] =
                        getSampleDataByField(selectedField);
                }
            } else {
                for (const field of fields) {
                    sampleData[field.slug] = getSampleDataByField(field);
                }
            }
        }

        return {
            id: 1,
            data: sampleData,
        };
    }
}
