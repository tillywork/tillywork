import { AutomationRunStatus } from "@tillywork/shared";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAutomationRunDto {
    @IsNotEmpty()
    @IsString()
    automationId: string;

    @IsOptional()
    @IsEnum(AutomationRunStatus)
    status?: AutomationRunStatus;
}
