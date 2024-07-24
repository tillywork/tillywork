import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateIf,
} from "class-validator";
import { CardType } from "../../card-types/card.type.entity";

export class CreateListDto {
    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsString()
    iconColor?: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @ValidateIf((o) => !o.workspaceId)
    @IsNotEmpty()
    @IsNumber()
    spaceId?: number;

    @ValidateIf((o) => !o.spaceId)
    @IsNotEmpty()
    @IsNumber()
    workspaceId?: number;

    @IsNotEmpty()
    defaultCardType: CardType;

    @IsBoolean()
    @IsOptional()
    createOnboardingData?: boolean;
}
