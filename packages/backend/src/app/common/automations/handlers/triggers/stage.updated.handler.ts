import { Injectable } from "@nestjs/common";
import {
    AutomationContext,
    BaseAutomationHandler,
} from "../automation.handler";

import { TriggerEvent } from "../../events/trigger.event";

import {
    TriggerType,
    AutomationFieldSchema,
    FieldTypes,
    GetHandlerFieldsParams,
    AutomationFieldOption,
    FieldChange,
} from "@tillywork/shared";

export type StageUpdatedPayload = Omit<TriggerEvent, "payload"> & {
    payload: FieldChange;
};

@Injectable()
export class StageUpdatedHandler extends BaseAutomationHandler {
    constructor() {
        super({
            metadata: {
                icon: "mdi-circle-slice-8",
                title: "Stage updated",
                section: "Card changes",
                value: TriggerType.STAGE_CHANGED,
            },
        });
    }

    async execute(
        payload: StageUpdatedPayload,
        { automation }: AutomationContext
    ): Promise<any> {
        const change = payload.payload;
        const triggerData = automation.trigger.data;

        let fromPassed = false;
        let toPassed = false;

        if (triggerData.from) {
            fromPassed = triggerData.from.includes(change.oldValue);
        } else {
            fromPassed = true;
        }

        if (triggerData.to) {
            toPassed = triggerData.to.includes(change.newValue);
        } else {
            toPassed = true;
        }

        return fromPassed && toPassed;
    }

    async getFields(
        params: GetHandlerFieldsParams
    ): Promise<Record<string, AutomationFieldSchema>> {
        const automation = await this.automationsService.findOne(
            params.automationId
        );
        const activeLists = await this.getAutomationLists({ automation });
        const toAndFromOptions: AutomationFieldOption[] =
            activeLists[0].listStages.map((stage) => ({
                title: stage.name,
                value: stage.id,
            }));

        const stepFields: Record<string, AutomationFieldSchema> = {
            from: {
                title: "From",
                type: FieldTypes.STAGE,
                options: toAndFromOptions,
                multiple: true,
            },
            to: {
                title: "To",
                type: FieldTypes.STAGE,
                options: toAndFromOptions,
                multiple: true,
            },
        };

        return stepFields;
    }
}
