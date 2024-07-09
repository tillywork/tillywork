import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";

export class CreateSpaceDto {
    @IsOptional()
    @IsString()
    icon?: string;
    @IsNotEmpty()
    @IsString()
    name: string;
    @IsNotEmpty()
    @IsNumber()
    workspaceId: number;
    @IsBoolean()
    @IsOptional()
    createOnboardingData?: boolean;
}
