import { Injectable } from "@nestjs/common";
import {
    BaseAutomationHandler,
    AutomationContext,
} from "../automation.handler";
import { ActionType, FieldTypes, ActivityType } from "@tillywork/shared";
import { CardActivitiesService } from "../../../cards/card-activities/card.activities.service";
import { User } from "src/app/common/users/user.entity";

export interface CreateCommentPayload {
    content: string;
    commenterId: number;
    cardId?: string;
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
            fields: {
                commenterId: {
                    title: "Commenter",
                    type: FieldTypes.USER,
                    required: true,
                },
                content: {
                    title: "Comment",
                    type: FieldTypes.RICH,
                    required: true,
                },
                cardId: {
                    title: "Card",
                    type: FieldTypes.CARD,
                    required: true,
                },
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
                content: {
                    type: "doc",
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                {
                                    type: "text",
                                    text: payload.content,
                                },
                            ],
                        },
                    ],
                },
                createdBy: {
                    id: payload.commenterId,
                } as User,
                createdByType: "automation",
            })
        );
    }
}
