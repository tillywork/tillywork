import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
} from "class-validator";

import { LocationType } from "@tillywork/shared";

export class CreateAutomationLocationDto {
    @IsOptional()
    @IsUUID()
    automationId: string;

    @IsNotEmpty()
    @IsNumber()
    locationId: number;

    @IsNotEmpty()
    @IsString()
    locationType: LocationType;
}
