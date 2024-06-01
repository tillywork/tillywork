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
import { ObjectHelper } from "./object.helper";

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
        } else {
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
                if (QueryBuilderHelper.isFilterGroup(condition)) {
                    const subQuery = QueryBuilderHelper.buildQuery(condition);
                    return { ...whereClause, ...subQuery };
                } else {
                    const queryPart = QueryBuilderHelper.fieldFilterToQuery(
                        condition as FieldFilter
                    );
                    // Adjust the merging strategy for nested conditions
                    return Object.entries(queryPart).reduce(
                        (acc, [key, value]) => {
                            if (value instanceof Function) {
                                // If the value is a function, use it directly without merging
                                acc[key] = value;
                            } else {
                                const current = acc[key];
                                if (
                                    current &&
                                    typeof current === "object" &&
                                    typeof value === "object"
                                ) {
                                    // If both are objects, merge them
                                    acc[key] = { ...current, ...value };
                                } else if (current !== undefined) {
                                    // If key exists but aren't both objects, convert to array
                                    acc[key] = Array.isArray(current)
                                        ? [...current, value]
                                        : [current, value];
                                } else {
                                    acc[key] = value;
                                }
                            }
                            return acc;
                        },
                        whereClause
                    );
                }
            }, {});
        } else if (filterGroup.or) {
            const orConditions = filterGroup.or.map((subCondition) => {
                return QueryBuilderHelper.isFilterGroup(subCondition)
                    ? QueryBuilderHelper.buildQuery(subCondition)
                    : QueryBuilderHelper.fieldFilterToQuery(subCondition);
            });
            // Use a conditional structure to handle 'or' relations
            return orConditions.length === 1 ? orConditions[0] : {};
        }
        return {};
    }

    // A type guard to check if a condition is a FilterGroup
    static isFilterGroup(
        condition: FieldFilter | FilterGroup
    ): condition is FilterGroup {
        return "and" in condition || "or" in condition;
    }
}
