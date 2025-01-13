import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateIf,
} from "class-validator";
import { ListGroupEntityTypes } from "../../types";
import { ListGroupOptions, QueryFilter } from "@tillywork/shared";

export class CreateListGroupDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsOptional()
    filter?: QueryFilter;

    @IsEnum(ListGroupOptions)
    @IsNotEmpty()
    type: ListGroupOptions;

    @ValidateIf((o) => o.entityType)
    @IsNotEmpty()
    @IsNumber()
    entityId?: number;

    @ValidateIf((o) => o.entityId)
    @IsNotEmpty()
    @IsEnum(ListGroupEntityTypes)
    entityType?: ListGroupEntityTypes;

    @IsString()
    @IsOptional()
    color?: string;

    @IsString()
    @IsOptional()
    icon?: string;

    @IsNumber()
    @IsOptional()
    order?: number;

    @IsBoolean()
    @IsOptional()
    isExpanded?: boolean;

    @IsOptional()
    @IsNumber()
    fieldId?: number;

    @IsNotEmpty()
    @IsNumber()
    listId?: number;
}
