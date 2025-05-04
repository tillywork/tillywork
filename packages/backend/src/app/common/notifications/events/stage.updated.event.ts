import { CardActivity } from "../../cards/card-activities/card.activity.entity";

export class NotificationStageUpdatedEvent {
    constructor(
        public readonly payload: {
            activity: CardActivity;
        }
    ) {}
}
