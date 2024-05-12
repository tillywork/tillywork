import { FilterEntityTypes, FilterGroup } from "../types";

export class CreateFilterDto {
    name?: string;
    where: FilterGroup;
    entityId: number;
    entityType: FilterEntityTypes;
}
