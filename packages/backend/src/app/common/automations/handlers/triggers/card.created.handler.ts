import { Injectable } from "@nestjs/common";

import { BaseAutomationHandler } from "../automation.handler";

import { TriggerType } from "@tillywork/shared";

@Injectable()
export class CardCreatedHandler extends BaseAutomationHandler {
    constructor() {
        super({
            metadata: {
                icon: "mdi-card-plus",
                title: "Card created",
                section: "Card changes",
                value: TriggerType.CARD_CREATED,
            },
        });
    }

    async execute(payload: any): Promise<any> {
        return payload;
    }
}
