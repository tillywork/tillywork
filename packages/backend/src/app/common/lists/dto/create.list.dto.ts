import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";
import { CardType } from "../../card-types/card.type.entity";

export class CreateListDto {
    @IsNotEmpty()
    @IsString()
    name: string;
    @IsNotEmpty()
    @IsNumber()
    spaceId: number;
    @IsNotEmpty()
    defaultCardType: CardType;
    @IsBoolean()
    @IsOptional()
    createOnboardingData?: boolean;
}
