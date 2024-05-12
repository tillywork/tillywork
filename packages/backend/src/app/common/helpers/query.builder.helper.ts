/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from "@nestjs/common";
import {
    Not,
    MoreThan,
    LessThan,
    Any,
    IsNull,
    Between,
    In,
    Like,
} from "typeorm";
import { FieldFilter, FilterGroup } from "../filters/types";
import dayjs from "dayjs";

@Injectable()
export class QueryBuilderHelper {
    private static readonly logger = new Logger("QueryBuilderHelper");

    static createNestedObjectFromPath(pathArray: string[], value: any): any {
        return pathArray.reverse().reduce((acc, key) => {
            return { [key]: acc };
        }, value);
    }

    static processValue(value: any) {
        if (Array.isArray(value)) {
            return value.map((value) => {
                return this.processValue(value);
            });
        } else if (typeof value === "string") {
            return value
                .replace(":startOfDay", dayjs().startOf("day").toISOString())
                .replace(":endOfDay", dayjs().endOf("day").toISOString());
        }
        else {
            return value;
        }
    }

    static fieldFilterToQuery(fieldFilter: FieldFilter) {
        const { field, operator, value } = fieldFilter;
        const pathArray = field.split(".");
        const processedValue = this.processValue(value);

        let mappedValue;
        switch (operator) {
            case "eq":
                mappedValue = processedValue;
                break;
            case "ne":
                mappedValue = Not(processedValue);
                break;
            case "gt":
                mappedValue = MoreThan(processedValue);
                break;
            case "lt":
                mappedValue = LessThan(processedValue);
                break;
            case "like":
                mappedValue = Like(`%${processedValue}%`);
                break;
            case "between":
                mappedValue = Between(processedValue[0], processedValue[1]);
                break;
            case "in":
                mappedValue = In(processedValue);
                break;
            case "isNull":
                mappedValue = IsNull();
                break;
            default:
                throw new Error(
                    `[QueryBuilderHelper#fieldFilterToQuery] No mapping for operator: ${operator}`
                );
        }

        const queryObject = QueryBuilderHelper.createNestedObjectFromPath(
            pathArray,
            mappedValue
        );
        return queryObject;
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
