/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from "@nestjs/common";
import { Card } from "../../cards/card.entity";

export interface ActionHandler {
    execute(config: any, card: Card): Promise<void>;
}

@Injectable()
export class UpdateCardFieldHandler implements ActionHandler {
    constructor() {
        //
    }
    async execute(action: any, card: Card): Promise<void> {
        // Implementation
    }
}

@Injectable()
export class CreateCardHandler implements ActionHandler {
    constructor() {
        //
    }
    async execute(action: any, card: Card): Promise<void> {
        // Implementation
    }
}

@Injectable()
export class SendEmailHandler implements ActionHandler {
    constructor() {
        //
    }
    async execute(action: any, card: Card): Promise<void> {
        // Implementation
    }
}

@Injectable()
export class SendWebhookHandler implements ActionHandler {
    constructor() {
        //
    }
    async execute(action: any, card: Card): Promise<void> {
        // Implementation
    }
}
