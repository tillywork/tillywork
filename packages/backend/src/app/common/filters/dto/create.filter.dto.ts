import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";
import { FilterEntityTypes, FilterGroup } from "../types";

export class CreateFilterDto {
    @IsString()
    @IsOptional()
    name?: string;
    @IsNotEmpty()
    where: FilterGroup;
    @IsNumber()
    @IsOptional()
    entityId?: number;
    @IsEnum(FilterEntityTypes)
    @IsOptional()
    entityType?: FilterEntityTypes;
}
