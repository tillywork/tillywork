import { Injectable } from "@nestjs/common";

import {
    BaseAutomationHandler,
    AutomationContext,
} from "../automation.handler";

import { CardActivitiesService } from "../../../cards/card-activities/card.activities.service";

import {
    ActionType,
    FieldTypes,
    ActivityType,
    TiptapContent,
} from "@tillywork/shared";

export interface CreateCommentPayload {
    content: TiptapContent;
}

@Injectable()
export class CreateCommentHandler extends BaseAutomationHandler {
    constructor(private readonly cardActivitiesService: CardActivitiesService) {
        super({
            metadata: {
                icon: "mdi-comment-plus",
                title: "Create a comment",
                section: "Card activities",
                value: ActionType.CREATE_COMMENT,
            },
        });
    }

    async execute(
        payload: CreateCommentPayload,
        context: AutomationContext
    ): Promise<void> {
        const { card } = context;

        if (!card) {
            throw new Error("Card is required for creating a comment");
        }

        await this.aclContext.run(true, () =>
            this.cardActivitiesService.create({
                card: card.id,
                type: ActivityType.COMMENT,
                content: payload.content,
                createdByType: "automation",
            })
        );
    }

    async getFields() {
        return {
            content: {
                title: "Comment",
                type: FieldTypes.RICH,
                required: true,
            },
        };
    }
}
