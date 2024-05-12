import { ListGroupEntityTypes, ListGroupOptions } from "../types";

export class CreateListGroupDto {
    name?: string;
    type: ListGroupOptions;
    isExpanded: true;
    listId: number;
    entityId?: number;
    entityType?: ListGroupEntityTypes;
}
