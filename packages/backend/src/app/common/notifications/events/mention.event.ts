import { CreatedByType } from "@tillywork/shared";

export class NotificationMentionEvent {
    constructor(
        public readonly payload: {
            cardId: number;
            createdById?: number;
            createdByType: CreatedByType;
            mentionedUserIds: number[];
            mentionedOn: "card" | "comment";
        }
    ) {}
}
