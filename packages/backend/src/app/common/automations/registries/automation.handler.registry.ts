import { Injectable, Logger } from "@nestjs/common";
import { ActionType, TriggerType } from "@tillywork/shared";
import { AutomationHandler } from "../handlers/automation.handler";

@Injectable()
export class AutomationHandlerRegistry {
    private readonly logger = new Logger("AutomationHandlerRegistry");
    private triggers: Map<TriggerType, AutomationHandler> = new Map();
    private actions: Map<ActionType, AutomationHandler> = new Map();

    registerTrigger(type: TriggerType, definition: AutomationHandler) {
        this.triggers.set(type, definition);
    }

    registerAction(type: ActionType, definition: AutomationHandler) {
        this.actions.set(type, definition);
    }

    getTrigger(type: TriggerType): AutomationHandler | undefined {
        return this.triggers.get(type);
    }

    getAction(type: ActionType): AutomationHandler | undefined {
        return this.actions.get(type);
    }

    getAllTriggers(): AutomationHandler[] {
        return Array.from(this.triggers.values());
    }

    getAllActions(): AutomationHandler[] {
        return Array.from(this.actions.values());
    }
}
