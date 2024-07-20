import { Injectable } from "@nestjs/common";
import {
    UpdateCardFieldHandler,
    CreateCardHandler,
    SendEmailHandler,
    SendWebhookHandler,
    ActionHandler,
} from "../handlers/action.handlers";
import { ActionType } from "../types";

@Injectable()
export class ActionHandlerFactory {
    constructor(
        private updateCardFieldHandler: UpdateCardFieldHandler,
        private createCardHandler: CreateCardHandler,
        private sendEmailHandler: SendEmailHandler,
        private sendWebhookHandler: SendWebhookHandler
    ) {}

    getHandler(type: ActionType): ActionHandler {
        switch (type) {
            case ActionType.ASSIGN_CARD:
            case ActionType.CHANGE_CARD_STAGE:
            case ActionType.UPDATE_CARD:
                return this.updateCardFieldHandler;
            case ActionType.CREATE_CARD:
                return this.createCardHandler;
            case ActionType.SEND_EMAIL:
                return this.sendEmailHandler;
            case ActionType.SEND_WEBHOOK:
                return this.sendWebhookHandler;
            default:
                throw new Error(`Unknown action type: ${type}`);
        }
    }
}
