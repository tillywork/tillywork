import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from "class-validator";
import { User } from "../../users/user.entity";
import { FieldItem, FieldTypes } from "@tillywork/shared";
import { Type } from "class-transformer";
import { CardType } from "../../card-types/card.type.entity";

export class CreateFieldDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    slug: string;

    @IsNotEmpty()
    @IsEnum(FieldTypes)
    type: FieldTypes;

    @IsOptional()
    @IsNumber()
    cardTypeId?: number;

    @IsOptional()
    @Type(() => CardType)
    dataCardType: CardType;

    @IsNotEmpty()
    @IsString()
    icon: string;

    @IsNotEmpty()
    @IsNumber()
    workspaceId: number;

    @IsOptional()
    @IsBoolean()
    required?: boolean = false;

    @IsOptional()
    @IsBoolean()
    multiple?: boolean = false;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FieldItemDto)
    items?: FieldItem[];

    @IsOptional()
    createdByType?: "system" | "user";

    @IsOptional()
    createdBy?: User;
}

class FieldItemDto {
    @IsString()
    @IsNotEmpty()
    item: string;

    @IsString()
    @IsOptional()
    color?: string;

    @IsString()
    @IsOptional()
    icon?: string;
}
