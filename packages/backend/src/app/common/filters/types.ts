export type FilterOperator =
    | "eq" // equals
    | "ne" // not equal
    | "gt" // greater than
    | "lt" // less than
    | "gte" // greater than or equal to
    | "lte" // less than or equal to
    | "in" // is in an array of values
    | "nin" // is not in an array of values
    | "like" // like (pattern matching)
    | "like%" // starts with
    | "%like" // ends with
    | "between" // between two values
    | "nbetween" // not between two values
    | "isNull" // checks if a value is null
    | "isNotNull"; // value is not null

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
    where?: FilterGroup | ViewFilter;
    // We can add more properties from TypeORM FindOptions (like take, skip, relations, etc.) as required.
}

export enum FilterEntityTypes {
    VIEW = "VIEW",
    LIST_GROUP = "LIST_GROUP",
}

export interface ViewFilter {
    where: {
        advanced?: FilterGroup;
        quick?: FilterGroup;
    };
}
