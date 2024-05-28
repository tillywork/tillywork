import { FilterGroup } from "../../../filters/types";
import { ListGroupEntityTypes, ListGroupOptions } from "../../types";

export class CreateListGroupDto {
    entityId?: number;
    entityType?: ListGroupEntityTypes;
    type?: ListGroupOptions;
    name?: string;
    filter?: {
        where: FilterGroup;
    };
    color?: string;
    icon?: string;
    order?: number;
    isExpanded?: boolean;
    listId?: number;
}
