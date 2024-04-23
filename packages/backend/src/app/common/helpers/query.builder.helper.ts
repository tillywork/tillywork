import { Injectable, Logger } from "@nestjs/common";
import { Not, MoreThan, LessThan, Any } from "typeorm";

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

@Injectable()
export class QueryBuilderHelper {
    private static readonly logger = new Logger("QueryBuilderHelper");

    static createNestedObjectFromPath(pathArray: string[], value: any): any {
        return pathArray.reverse().reduce((acc, key) => {
            return { [key]: acc };
        }, value);
    }

    static fieldFilterToQuery(fieldFilter: FieldFilter) {
        const { field, operator, value } = fieldFilter;
        const pathArray = field.split(".");
        const nestedValue = QueryBuilderHelper.createNestedObjectFromPath(
            pathArray,
            value
        );
        QueryBuilderHelper.logger.debug({ fieldFilter });
        // Mapping between the FilterOperator and TypeORM where clause

        switch (operator) {
            case "eq":
                return nestedValue;
            case "ne":
                return { [pathArray[pathArray.length - 1]]: Not(value) };
            // ... Add additional cases for other operators
            default:
                return {};
        }
    }

    static applyOrConditions(
        orConditions: (FieldFilter | FilterGroup)[]
    ): any[] {
        return orConditions.map((condition) => {
            if (
                (condition as FilterGroup).and ||
                (condition as FilterGroup).or
            ) {
                return QueryBuilderHelper.buildQuery(condition as FilterGroup);
            } else {
                return QueryBuilderHelper.fieldFilterToQuery(
                    condition as FieldFilter
                );
            }
        });
    }

    static buildQuery(filterGroup: FilterGroup): any {
        if (filterGroup.and) {
            return filterGroup.and.reduce((whereClause, condition) => {
                if (
                    (condition as FilterGroup).and ||
                    (condition as FilterGroup).or
                ) {
                    Object.assign(
                        whereClause,
                        QueryBuilderHelper.buildQuery(condition as FilterGroup)
                    );
                } else {
                    Object.assign(
                        whereClause,
                        QueryBuilderHelper.fieldFilterToQuery(
                            condition as FieldFilter
                        )
                    );
                }
                return whereClause;
            }, {});
        } else if (filterGroup.or) {
            // We use `Any` from TypeORM for OR conditions
            const orConditions = filterGroup.or.map((subCondition) => {
                const queryConditions = QueryBuilderHelper.applyOrConditions([
                    subCondition,
                ]);

                // Construct OR conditions as an array of query conditions
                return queryConditions.length === 1
                    ? queryConditions[0]
                    : Any(queryConditions);
            });

            // If there's only one condition, return it directly, otherwise merge them with `Any`
            return orConditions.length === 1
                ? orConditions[0]
                : Any(orConditions);
        }
        return {};
    }
}
