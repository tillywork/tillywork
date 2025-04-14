import { Injectable } from "@nestjs/common";

import { BaseAutomationHandler } from "../automation.handler";

import { TriggerType } from "@tillywork/shared";

@Injectable()
export class CommentCreatedHandler extends BaseAutomationHandler {
    constructor() {
        super({
            metadata: {
                icon: "mdi-card-plus",
                title: "Comment created",
                section: "Card activities",
                value: TriggerType.COMMENT_CREATED,
            },
        });
    }

    async execute(payload: any): Promise<any> {
        return payload;
    }
}
