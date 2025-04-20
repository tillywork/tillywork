import {
    IsArray,
    IsNotEmpty,
    IsOptional,
    ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

import { User } from "../../users/user.entity";

import { CreateAutomationStepDto } from "./create.automation.step.dto";

import { CreateAutomationLocationDto } from "./create.automation.location.dto";

export class CreateAutomationDto {
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAutomationStepDto)
    steps?: CreateAutomationStepDto[];

    @IsOptional()
    @Type(() => CreateAutomationStepDto)
    trigger?: CreateAutomationStepDto;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAutomationLocationDto)
    locations?: CreateAutomationLocationDto[];

    @IsNotEmpty()
    workspaceId: number;

    createdBy?: User;
}
