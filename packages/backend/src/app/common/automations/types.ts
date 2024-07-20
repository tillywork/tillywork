/* eslint-disable @typescript-eslint/no-explicit-any */
export enum TriggerType {
    CARD_CREATED = "card_created",
    CARD_FIELD_CHANGED = "card_field_changed",
    CARD_STAGE_CHANGED = "card_stage_changed",
}

export enum ActionType {
    CREATE_CARD = "create_card",
    UPDATE_CARD = "update_card",
    CHANGE_CARD_STAGE = "update_card_stage",
    ASSIGN_CARD = "assign_card",
    SEND_EMAIL = "send_email",
    SEND_WEBHOOK = "send_webhook",
}
