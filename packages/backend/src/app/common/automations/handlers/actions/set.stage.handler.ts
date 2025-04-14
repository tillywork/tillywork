import { Injectable } from "@nestjs/common";

import {
    AutomationContext,
    BaseAutomationHandler,
} from "../automation.handler";

import { CardListsService } from "src/app/common/cards/card-lists/card.lists.service";
import { CardList } from "src/app/common/cards/card-lists/card.list.entity";

import {
    ActionType,
    AutomationFieldSchema,
    FieldTypes,
    GetHandlerFieldsParams,
} from "@tillywork/shared";

export type ChangeAssigneePayload = {
    listStageId: number;
};

@Injectable()
export class SetStageHandler extends BaseAutomationHandler {
    constructor(private cardListsService: CardListsService) {
        super({
            metadata: {
                icon: "mdi-view-list",
                title: "Set stage",
                section: "Card management",
                value: ActionType.SET_STAGE,
            },
        });
    }

    async execute(
        payload: ChangeAssigneePayload,
        context: AutomationContext
    ): Promise<CardList> {
        const { card } = context;

        const updatedCardList = await this.aclContext.run(true, () =>
            this.cardListsService.update(card.cardLists[0].id, {
                listStageId: payload.listStageId,
            })
        );

        return updatedCardList;
    }

    async getFields(
        params: GetHandlerFieldsParams
    ): Promise<Record<string, AutomationFieldSchema>> {
        const automation = await this.automationsService.findOne(
            params.automationId
        );
        const lists = await this.getAutomationLists({ automation });
        const activeList = lists[0];

        const stepFields: Record<string, AutomationFieldSchema> = {
            listStageId: {
                title: "New stage",
                type: FieldTypes.STAGE,
                options: activeList.listStages.map((stage) => ({
                    title: stage.name,
                    value: stage.id,
                })),
            },
        };

        return stepFields;
    }
}
