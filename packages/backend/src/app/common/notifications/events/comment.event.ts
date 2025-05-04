import { CardActivity } from "../../cards/card-activities/card.activity.entity";

export class NotificationCommentEvent {
    constructor(
        public readonly payload: {
            cardId: number;
            comment: CardActivity;
            mentionedUserIds?: number[];
        }
    ) {}
}
