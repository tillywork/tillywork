import { Injectable } from "@nestjs/common";

import { TillyLogger } from "../../logger/tilly.logger";

import { AutomationStep } from "../entities/automation.step.entity";

@Injectable()
export class PlaceholderProcessorService {
    private readonly logger = new TillyLogger("PlaceholderProcessorService");

    processStepData(
        step: AutomationStep,
        runOutput: any[]
    ): Record<string, any> {
        return this.processData(step.data, runOutput);
    }

    processData(
        data: Record<string, any>,
        runOutput: any[]
    ): Record<string, any> {
        const processedData: Record<string, any> = {};

        for (const [key, value] of Object.entries(data)) {
            processedData[key] = this.processValue(value, runOutput);
        }

        return processedData;
    }

    private processValue(value: any, runOutput: any[]): any {
        if (value === null || value === undefined) {
            return value;
        }

        if (typeof value === "string") {
            let result = value;

            if (value.includes("{{trigger.")) {
                result = this.processTriggerPlaceholderInString(
                    result,
                    runOutput
                );
            }

            if (value.includes("{{step_")) {
                result = this.processStepPlaceholderInString(result, runOutput);
            }

            return result;
        }

        if (Array.isArray(value)) {
            return value.map((item) => this.processValue(item, runOutput));
        }

        if (typeof value === "object") {
            const processed: Record<string, any> = {};
            for (const [key, val] of Object.entries(value)) {
                processed[key] = this.processValue(val, runOutput);
            }
            return processed;
        }

        return value;
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
