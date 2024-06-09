/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from "@nestjs/common";
import {
    Not,
    MoreThan,
    LessThan,
    IsNull,
    Between,
    In,
    Like,
    And,
    Equal,
    FindOperator,
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
        const datePlaceholders = {
            ":startOfDay": dayjs().startOf("day").toISOString(),
            ":endOfDay": dayjs().endOf("day").toISOString(),
            ":startOfYesterday": dayjs()
                .subtract(1, "day")
                .startOf("day")
                .toISOString(),
            ":endOfYesterday": dayjs()
                .subtract(1, "day")
                .endOf("day")
                .toISOString(),
            ":startOfTomorrow": dayjs()
                .add(1, "day")
                .startOf("day")
                .toISOString(),
            ":endOfTomorrow": dayjs().add(1, "day").endOf("day").toISOString(),
            ":startOfLastWeek": dayjs()
                .subtract(1, "week")
                .startOf("week")
                .toISOString(),
            ":endOfLastWeek": dayjs()
                .subtract(1, "week")
                .endOf("week")
                .toISOString(),
            ":startOfWeek": dayjs().startOf("week").toISOString(),
            ":endOfWeek": dayjs().endOf("week").toISOString(),
            ":startOfNextWeek": dayjs()
                .add(1, "week")
                .startOf("week")
                .toISOString(),
            ":endOfNextWeek": dayjs()
                .add(1, "week")
                .endOf("week")
                .toISOString(),
            ":startOfLastMonth": dayjs()
                .subtract(1, "month")
                .startOf("month")
                .toISOString(),
            ":endOfLastMonth": dayjs()
                .subtract(1, "month")
                .endOf("month")
                .toISOString(),
            ":startOfMonth": dayjs().startOf("month").toISOString(),
            ":endOfMonth": dayjs().endOf("month").toISOString(),
            ":startOfNextMonth": dayjs()
                .add(1, "month")
                .startOf("month")
                .toISOString(),
            ":endOfNextMonth": dayjs()
                .add(1, "month")
                .endOf("month")
                .toISOString(),
            ":startOfLastYear": dayjs()
                .subtract(1, "year")
                .startOf("year")
                .toISOString(),
            ":endOfLastYear": dayjs()
                .subtract(1, "year")
                .endOf("year")
                .toISOString(),
            ":startOfYear": dayjs().startOf("year").toISOString(),
            ":endOfYear": dayjs().endOf("year").toISOString(),
            ":startOfNextYear": dayjs()
                .add(1, "year")
                .startOf("year")
                .toISOString(),
            ":endOfNextYear": dayjs()
                .add(1, "year")
                .endOf("year")
                .toISOString(),
            ":startOfTime": dayjs(0).toISOString(),
            ":endOfTime": dayjs("2500").toISOString(),
        };

        if (Array.isArray(value)) {
            return value.map((value) => {
                return this.processValue(value);
            });
        } else if (typeof value === "string") {
            Object.keys(datePlaceholders).forEach((placeholder) => {
                value = value.replace(
                    placeholder,
                    datePlaceholders[placeholder]
                );
            });
            return value;
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
                mappedValue = Equal(processedValue);
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
            case "like%":
                mappedValue = Like(`${processedValue}%`);
                break;
            case "%like":
                mappedValue = Like(`%${processedValue}`);
                break;
            case "between":
                mappedValue = Between(processedValue[0], processedValue[1]);
                break;
            case "nbetween":
                mappedValue = Not(
                    Between(processedValue[0], processedValue[1])
                );
                break;
            case "in":
                mappedValue = In(processedValue);
                break;
            case "nin":
                mappedValue = Not(In(processedValue));
                break;
            case "isNull":
                mappedValue = IsNull();
                break;
            case "isNotNull":
                mappedValue = Not(IsNull());
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

                    return Object.entries(queryPart).reduce(
                        (acc, [key, value]) => {
                            const current = acc[key];
                            if (
                                !!current &&
                                this.isObject(current) &&
                                this.isObject(value)
                            ) {
                                /**
                                 * If key exists and both are objects, merge them
                                 */
                                acc[key] = { ...current, ...(value as object) };
                            } else if (!!current && !this.isObject(value)) {
                                /**
                                 * If key exists, and the incoming value is not an object,
                                 * multiple filters exist on the same property, merge them
                                 * with And operator
                                 */
                                acc[key] = And(
                                    current,
                                    value as FindOperator<any>
                                );
                            } else {
                                /**
                                 * If key doesn't exist, set it
                                 */
                                acc[key] = value;
                            }
                            return acc;
                        },
                        whereClause
                    );
                }
            }, {});
        }

        return {};
    }

    static isFilterGroup(
        condition: FieldFilter | FilterGroup
    ): condition is FilterGroup {
        return "and" in condition || "or" in condition;
    }

    /**
     * Check if given value is an object
     * and not a TypeORM operator such as Like or IsNull
     * @param value
     * @returns boolean
     */
    static isObject(value: any) {
        return typeof value === "object" && !("_type" in value);
    }
}
