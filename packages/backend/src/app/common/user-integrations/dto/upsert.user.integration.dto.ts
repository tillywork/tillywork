import { IntegrationType } from "@tillywork/shared";
import { IsEnum, IsObject } from "class-validator";

export class UpsertUserIntegrationDto {
    @IsEnum(IntegrationType)
    type: IntegrationType;

    @IsObject()
    config: Record<string, any>;
}
