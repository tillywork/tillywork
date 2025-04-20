import { ActionType, AutomationStepType, TriggerType } from "@tillywork/shared";
import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateAutomationStepDto {
    @IsNotEmpty()
    type: AutomationStepType;

    @IsOptional()
    value: ActionType | TriggerType;

    @IsNotEmpty()
    data: any;
}
