import { TriggerType } from "@tillywork/shared";

export class TriggerEvent {
    constructor(
        public readonly triggerType: TriggerType,
        public readonly cardId: number,
        public readonly payload?: any
    ) {}
}
