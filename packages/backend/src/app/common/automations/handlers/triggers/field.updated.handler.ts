import { Injectable } from "@nestjs/common";
import { BaseAutomationHandler } from "../automation.handler";
import {
    TriggerType,
    AutomationFieldSchema,
    FieldTypes,
    GetHandlerFieldsParams,
    AutomationFieldOption,
} from "@tillywork/shared";
import { getSampleDataByField } from "../../helpers/sample.data.helper";

export interface FieldUpdatedPayload {
    field: string;
    oldValue: any;
    newValue: any;
    addedItems?: any[];
    removedItems?: any[];
}

@Injectable()
export class FieldUpdatedHandler extends BaseAutomationHandler {
    constructor() {
        super({
            metadata: {
                icon: "mdi-text-box-edit",
                title: "Field updated",
                section: "Card changes",
                value: TriggerType.FIELD_UPDATED,
            },
        });
    }

    async execute(payload: FieldUpdatedPayload): Promise<any> {
        return payload;
    }

    async getFields(
        params: GetHandlerFieldsParams
    ): Promise<Record<string, AutomationFieldSchema>> {
        const fields = (await this.getCardFields(params.automationId)).filter(
            (f) => ![FieldTypes.RICH].includes(f.type)
        );
        const automation = await this.automationsService.findOne(
            params.automationId
        );

        const stepFields: Record<string, AutomationFieldSchema> = {
            field: {
                title: "Field to watch",
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

            const supportedFieldType =
                selectedField &&
                ![
                    FieldTypes.RICH,
                    FieldTypes.TEXT,
                    FieldTypes.DATE,
                    FieldTypes.DATETIME,
                ].includes(selectedField.type);

            if (supportedFieldType) {
                this.logger.debug({ supportedFieldType, selectedField });
                let toAndFromOptions: AutomationFieldOption[] = [];

                switch (selectedField.type) {
                    case FieldTypes.USER:
                        toAndFromOptions =
                            await this.getListUsersAsFieldOptions({
                                automation,
                            });
                        break;
                    default:
                        toAndFromOptions = selectedField.items?.map((item) => ({
                            title: item.item,
                            value: item.item,
                        }));
                }

                //TODO these fields need to be of type FilterQuery, to support custom values like any, or none, or all
                stepFields["from"] = {
                    title: "From",
                    type: selectedField.type,
                    options: toAndFromOptions,
                    multiple: true,
                    refreshers: ["field"],
                    allowDynamicValues: true,
                };

                stepFields["to"] = {
                    title: "To",
                    type: selectedField.type,
                    options: toAndFromOptions,
                    multiple: true,
                    refreshers: ["field"],
                    allowDynamicValues: true,
                };
            }
        }

        return stepFields;
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
