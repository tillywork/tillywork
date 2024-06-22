import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
} from "class-validator";
import { FieldItem, FieldTypes } from "../types";

export class CreateFieldDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsEnum(FieldTypes)
    type: FieldTypes;

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
}
