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
import { FieldTypes } from "@tillywork/shared";
import { Type } from "class-transformer";

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
    @IsNumber()
    dataCardTypeId?: number;

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
    @Type(() => FieldItem)
    items?: FieldItem[];

    @IsOptional()
    createdByType?: "system" | "user";

    @IsOptional()
    createdBy?: User;
}

class FieldItem {
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
