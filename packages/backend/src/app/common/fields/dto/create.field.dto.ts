import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";
import { User } from "../../users/user.entity";
import { FieldItem, FieldTypes } from "@tillywork/shared";

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
    items?: FieldItem[];

    @IsOptional()
    createdByType?: "system" | "user";

    @IsOptional()
    createdBy?: User;
}
