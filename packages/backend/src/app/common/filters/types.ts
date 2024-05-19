/* eslint-disable @typescript-eslint/no-explicit-any */
export type FilterOperator =
    | "eq"
    | "ne"
    | "gt"
    | "lt"
    | "gte"
    | "lte"
    | "like"
    | "between"
    | "in"
    | "isNull";

export interface FieldFilter {
    field: string;
    operator: FilterOperator;
    value: any; // Value can depend on the operator
}

export interface FilterGroup {
    and?: (FieldFilter | FilterGroup)[];
    or?: (FieldFilter | FilterGroup)[];
}

export interface QueryFilter {
    where?: FilterGroup;
    // We can add more properties from TypeORM FindOptions (like take, skip, relations, etc.) as required.
}

export enum FilterEntityTypes {
    VIEW = "VIEW",
    LIST_GROUP = "LIST_GROUP",
}
