import { Injectable } from "@nestjs/common";
import {
    AutomationContext,
    BaseAutomationHandler,
} from "../automation.handler";
import {
    TriggerType,
    AutomationFieldSchema,
    FieldTypes,
    GetHandlerFieldsParams,
    AutomationFieldOption,
    FieldChange,
    normalizeFieldValue,
    Field,
} from "@tillywork/shared";
import { TriggerEvent } from "../../events/trigger.event";
import { isEqual } from "lodash";

export type FieldUpdatedPayload = Omit<TriggerEvent, "payload"> & {
    payload: FieldChange;
};

@Injectable()
export class FieldUpdatedHandler extends BaseAutomationHandler {
    constructor() {
        super({
            metadata: {
                icon: "mdi-format-line-height",
                title: "Field updated",
                section: "Card changes",
                value: TriggerType.FIELD_UPDATED,
            },
        });
    }

    async execute(
        payload: FieldUpdatedPayload,
        { automation }: AutomationContext
    ): Promise<any> {
        const change = payload.payload;
        const triggerData = automation.trigger.data;
        const fields = await this.getCardFields(automation.id);
        const updatedField = fields.find((f) => f.slug === change.field.slug);

        if (!!triggerData.field && change.field.slug !== triggerData.field) {
            return false;
        }

        let fromPassed = false;
        let toPassed = false;

        if (triggerData.from) {
            const normalizedFromValue = normalizeFieldValue({
                v: triggerData.from,
                field: updatedField as unknown as Field,
            });

            fromPassed = isEqual(normalizedFromValue, change.oldValue);
        } else {
            fromPassed = true;
        }

        if (triggerData.to) {
            const normalizedToValue = normalizeFieldValue({
                v: triggerData.to,
                field: updatedField as unknown as Field,
            });

            toPassed = isEqual(normalizedToValue, change.newValue);
        } else {
            toPassed = true;
        }

        return fromPassed && toPassed;
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
                    multiple: selectedField.multiple,
                    refreshers: ["field"],
                };

                stepFields["to"] = {
                    title: "To",
                    type: selectedField.type,
                    options: toAndFromOptions,
                    multiple: selectedField.multiple,
                    refreshers: ["field"],
                };
            }
        }

        return stepFields;
    }
}
