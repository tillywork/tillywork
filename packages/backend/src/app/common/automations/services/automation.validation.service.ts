import { Injectable } from "@nestjs/common";
import { TillyLogger } from "../../logger/tilly.logger";

import { AutomationsService } from "./automations.service";
import { AutomationHandlerRegistry } from "../registries/automation.handler.registry";

import {
    ActionType,
    AutomationStepType,
    AutomationValidationResponse,
    TriggerType,
    ValidateStepParams,
} from "@tillywork/shared";

@Injectable()
export class AutomationValidationService {
    private readonly logger = new TillyLogger("AutomationValidationService");

    constructor(
        private automationHandlerRegistry: AutomationHandlerRegistry,
        private automationService: AutomationsService
    ) {}

    async validateAutomationBeforeRun(
        automationId: string
    ): Promise<AutomationValidationResponse> {
        const automation = await this.automationService.findOne(automationId);

        // Validate trigger
        if (!automation.trigger) {
            return {
                isValid: false,
                message: "Automation trigger is empty",
            };
        }

        const triggerValidation = await this.validateStep({
            type: automation.trigger.type,
            value: automation.trigger.value,
            data: automation.trigger.data,
            automationId: automation.id,
        });

        if (!triggerValidation.isValid) {
            return triggerValidation;
        }

        // Validate step count
        if (automation.steps.length > 3) {
            return {
                isValid: false,
                message: "Automation step limit (3) exceeded",
            };
        }

        // Validate each step
        for (const step of automation.steps) {
            const stepValidation = await this.validateStep({
                type: step.type,
                value: step.value,
                data: step.data,
                automationId: automation.id,
            });
            if (!stepValidation.isValid) {
                return stepValidation;
            }
        }

        return {
            isValid: true,
        };
    }

    async validateStep({
        type,
        value,
        data,
        automationId,
    }: ValidateStepParams): Promise<AutomationValidationResponse> {
        // Validate step value is not empty
        if (!value) {
            return {
                isValid: false,
                message: "Step handler is empty",
            };
        }

        // Get handler for the step
        const handler =
            type === AutomationStepType.TRIGGER
                ? this.automationHandlerRegistry.getTrigger(
                      value as TriggerType
                  )
                : this.automationHandlerRegistry.getAction(value as ActionType);

        if (!handler) {
            return {
                isValid: false,
                message: "Step handler not found",
            };
        }

        // Get required fields from handler
        const fields = await handler.getFields({
            automationId,
            data,
            type: value as TriggerType | ActionType,
        });

        // Validate required fields are set
        for (const [fieldName, fieldSchema] of Object.entries(fields)) {
            if (fieldSchema.required && !data[fieldName]) {
                return {
                    isValid: false,
                    message: `${fieldSchema.title} is empty`,
                };
            }
        }

        return {
            isValid: true,
        };
    }
}
