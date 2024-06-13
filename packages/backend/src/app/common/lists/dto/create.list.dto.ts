import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";

export class CreateListDto {
    @IsNotEmpty()
    @IsString()
    name: string;
    @IsNotEmpty()
    @IsNumber()
    spaceId: number;
    @IsNotEmpty()
    @IsNumber()
    defaultCardTypeId: number;
    @IsBoolean()
    @IsOptional()
    createOnboardingData?: boolean;
}
