import {
    IsBoolean,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";
import { FilterGroup } from "../../../filters/types";
import { ListGroupEntityTypes, ListGroupOptions } from "../../types";
import { List } from "../../list.entity";

export class CreateListGroupDto {
    @IsNumber()
    @IsOptional()
    entityId?: number;
    @IsEnum(List)
    @IsOptional()
    entityType?: ListGroupEntityTypes;
    @IsEnum(ListGroupOptions)
    @IsOptional()
    type?: ListGroupOptions;
    @IsString()
    @IsOptional()
    name?: string;
    @IsOptional()
    filter?: {
        where: FilterGroup;
    };
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
    @IsNumber()
    listId?: number;
}
