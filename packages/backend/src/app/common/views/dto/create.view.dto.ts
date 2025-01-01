import { ViewTypes, ViewOptions } from "@tillywork/shared";
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
} from "class-validator";

export class CreateViewDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEnum(ViewTypes)
    type: ViewTypes;

    @IsNotEmpty()
    @IsNumber()
    listId: number;

    @IsOptional()
    @IsObject()
    options?: ViewOptions;
}
