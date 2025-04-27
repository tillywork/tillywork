import { FieldChange } from "@tillywork/shared";

export class NotificationAssigneeEvent {
    constructor(
        public readonly payload: {
            cardId: number;
            workspaceId: number;
            assigneeChange: FieldChange;
            createdById?: number;
        }
    ) {}
}
