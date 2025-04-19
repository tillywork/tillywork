import { Injectable } from "@nestjs/common";

import { TillyLogger } from "../../logger/tilly.logger";

import { AutomationStep } from "../entities/automation.step.entity";
import { Card } from "../../cards/card.entity";

@Injectable()
export class PlaceholderProcessorService {
    private readonly logger = new TillyLogger("PlaceholderProcessorService");

    processStepData(
        step: AutomationStep,
        card: Card,
        runOutput: any[]
    ): Record<string, any> {
        return this.processData(step.data, card, runOutput);
    }

    processData(
        data: Record<string, any>,
        card: Card,
        runOutput: any[]
    ): Record<string, any> {
        const processedData: Record<string, any> = {};

        for (const [key, value] of Object.entries(data)) {
            processedData[key] = this.processValue(value, card, runOutput);
        }

        return processedData;
    }

    //TODO need to make this accept the previous step data instead of card. Maybe also add the card as part of the context?
    private processValue(value: any, card: Card, runOutput: any[]): any {
        if (typeof value !== "string") {
            return value;
        }

        let result = value;

        // Process trigger placeholders
        if (value.includes("{{trigger.")) {
            result = this.processTriggerPlaceholderInString(result, runOutput);
        }

        // Process step placeholders
        if (value.includes("{{step_")) {
            result = this.processStepPlaceholderInString(result, runOutput);
        }

        return result;
    }

    private processTriggerPlaceholderInString(
        value: string,
        runOutput: any[]
    ): string {
        const regex = /{{trigger\.(.*?)}}/g;
        return value.replace(regex, (match, path) => {
            const parts = this.parsePath(path);
            let current: any = runOutput[0];

            for (const part of parts) {
                if (current === undefined || current === null) {
                    return "";
                }
                current = current[part];
            }

            return current?.toString() ?? "";
        });
    }

    private processStepPlaceholderInString(
        value: string,
        runOutput: any[]
    ): string {
        const regex = /{{step_(\d+)\.(.*?)}}/g;
        return value.replace(regex, (match, stepIndexStr, path) => {
            const stepIndex = parseInt(stepIndexStr);
            const parts = this.parsePath(path);

            if (stepIndex < 0 || stepIndex >= runOutput.length) {
                this.logger.warn(
                    `Step ${stepIndex} not found in previous step runs`
                );
                return "";
            }

            const stepRun = runOutput[stepIndex];
            let current: any = stepRun;

            for (const part of parts) {
                if (current === undefined || current === null) {
                    return "";
                }
                current = current[part];
            }

            return current?.toString() ?? "";
        });
    }

    private parsePath(path: string): string[] {
        // Split by dots and array access notation
        const parts: string[] = [];
        let currentPart = "";
        let inArray = false;
        let arrayIndex = "";

        for (let i = 0; i < path.length; i++) {
            const char = path[i];

            if (char === "[") {
                inArray = true;
                if (currentPart) {
                    parts.push(currentPart);
                    currentPart = "";
                }
            } else if (char === "]") {
                inArray = false;
                if (arrayIndex) {
                    parts.push(arrayIndex);
                    arrayIndex = "";
                }
            } else if (char === ".") {
                if (!inArray) {
                    if (currentPart) {
                        parts.push(currentPart);
                        currentPart = "";
                    }
                } else {
                    arrayIndex += char;
                }
            } else {
                if (inArray) {
                    arrayIndex += char;
                } else {
                    currentPart += char;
                }
            }
        }

        // Add the last part if exists
        if (currentPart) {
            parts.push(currentPart);
        }

        return parts;
    }
}
