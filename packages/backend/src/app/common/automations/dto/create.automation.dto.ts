import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    ValidateNested,
} from "class-validator";
import { FieldFilter } from "../../filters/types";
import { TriggerType } from "../types";
import { CreateAutomationActionDto } from "./create.automation.action.dto";
import { User } from "../../users/user.entity";
import { Type } from "class-transformer";

export class CreateAutomationDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsEnum(TriggerType)
    triggerType: TriggerType;

    @IsOptional()
    @IsArray()
    conditions?: FieldFilter[];

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAutomationActionDto)
    actions: CreateAutomationActionDto[];

    @IsNotEmpty()
    workspaceId: number;

    createdBy?: User;
}
