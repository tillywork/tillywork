/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from "@nestjs/common";
import { WhereExpressionBuilder, Brackets, SelectQueryBuilder } from "typeorm";
import { FieldFilter, FilterGroup, FilterOperator } from "../filters/types";
import dayjs from "dayjs";

@Injectable()
export class QueryBuilderHelper {
    private static readonly logger = new Logger("QueryBuilderHelper");

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

    /**
     * Processes the field name to extract
     * the value from jsonb columns defined
     * in the prefix.
     * @param name The field name (e.g card.data.1)
     * @param prefix The prefix to look for that is a jsonb column (card.data)
     * @returns the field name to use in the SQL query (e.g card.data ->> 1)
     */
    static processFieldName({
        fieldFilter,
        prefix,
    }: {
        fieldFilter: FieldFilter;
        prefix: string;
    }) {
        const { field, operator } = fieldFilter;
        const pathArray = field.split(".");
        let extractionOperator: "->>" | "->";

        if (["in", "nin"].includes(operator)) {
            extractionOperator = "->";
        } else {
            extractionOperator = "->>";
        }

        // If path starts with prefix (e.g card.data), it is a JSONB column, so we parse it differently
        if (field.startsWith(prefix)) {
            return `${prefix} ${extractionOperator} '${
                pathArray[pathArray.length - 1]
            }'`;
        } else {
            return field;
        }
    }

    /**
     * Prevents running queries that will throw
     * errors due to invalid values. E.g querying
     * on an empty array, or a string with null value.
     * @param fieldFilter The field filter to validate.
     * @returns boolean indicating if field value is valid.
     */
    static validateFieldFilter(fieldFilter: FieldFilter) {
        const textOperators: FilterOperator[] = ["eq", "ne"];
        const arrayOperators: FilterOperator[] = [
            "in",
            "nin",
            "between",
            "nbetween",
        ];

        if (textOperators.includes(fieldFilter.operator)) {
            if (!fieldFilter.value) {
                return false;
            }
        } else if (arrayOperators.includes(fieldFilter.operator)) {
            if (!fieldFilter.value || !fieldFilter.value.length) {
                return false;
            }
        }

        return true;
    }

    static fieldFilterToQuery(
        queryBuilder: WhereExpressionBuilder,
        fieldFilter: FieldFilter
    ): WhereExpressionBuilder {
        const { field, operator, value } = fieldFilter;
        const cardPrefix = "card.data";
        const fieldName = this.processFieldName({
            fieldFilter,
            prefix: cardPrefix,
        });
        const processedValue = this.processValue(value);

        if (!this.validateFieldFilter(fieldFilter)) {
            return;
        }

        switch (operator) {
            case "eq":
                return queryBuilder.andWhere(`${fieldName} = :${field}`, {
                    [field]: processedValue,
                });
            case "ne":
                return queryBuilder.andWhere(`${fieldName} != :${field}`, {
                    [field]: processedValue,
                });
            case "gt":
                return queryBuilder.andWhere(`${fieldName} > :${field}`, {
                    [field]: processedValue,
                });
            case "lt":
                return queryBuilder.andWhere(`${fieldName} < :${field}`, {
                    [field]: processedValue,
                });
            case "gte":
                return queryBuilder.andWhere(`${fieldName} >= :${field}`, {
                    [field]: processedValue,
                });
            case "lte":
                return queryBuilder.andWhere(`${fieldName} <= :${field}`, {
                    [field]: processedValue,
                });
            case "in": {
                let operator: "in" | "@>";

                let value = `(${processedValue.join(",")})`;
                if (fieldName.startsWith(cardPrefix)) {
                    operator = "@>";
                    value = `'["${processedValue.join('","')}"]'`;
                } else operator = "in";

                return queryBuilder.andWhere(
                    `${fieldName} ${operator} ${value}`
                );
            }
            case "nin": {
                let operator: "not in" | "@>" = "not in";
                let value = `(${processedValue.join(",")})`;
                let query = `${fieldName} ${operator} ${value}`;

                if (fieldName.startsWith(cardPrefix)) {
                    operator = "@>";
                    value = `'["${processedValue.join('","')}"]'`;
                    query = `NOT (${fieldName} ${operator} ${value})`;
                }

                return queryBuilder.andWhere(query);
            }
            case "like":
                return queryBuilder.andWhere(`${fieldName} LIKE :${field}`, {
                    [field]: `%${processedValue}%`,
                });
            case "like%":
                return queryBuilder.andWhere(`${fieldName} LIKE :${field}`, {
                    [field]: `${processedValue}%`,
                });
            case "%like":
                return queryBuilder.andWhere(`${fieldName} LIKE :${field}`, {
                    [field]: `%${processedValue}`,
                });
            case "between":
                return queryBuilder.andWhere(
                    `${fieldName} BETWEEN :${field}1 AND :${field}2`,
                    {
                        [`${field}1`]: processedValue[0],
                        [`${field}2`]: processedValue[1],
                    }
                );
            case "nbetween":
                return queryBuilder.andWhere(
                    `${fieldName} NOT BETWEEN :${field}1 AND :${field}2`,
                    {
                        [`${field}1`]: processedValue[0],
                        [`${field}2`]: processedValue[1],
                    }
                );
            case "isNull":
                return queryBuilder.andWhere(`${fieldName} IS NULL`);
            case "isNotNull":
                return queryBuilder.andWhere(`${fieldName} IS NOT NULL`);
            default:
                throw new Error(
                    `[QueryBuilderHelper] Unsupported operator: ${operator}`
                );
        }
    }

    static buildQuery(
        queryBuilder: SelectQueryBuilder<any>,
        filterGroup: FilterGroup
    ): SelectQueryBuilder<any> {
        if (filterGroup.and && filterGroup.and.length > 0) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    filterGroup.and.forEach((condition) => {
                        if (!this.isFilterGroup(condition)) {
                            this.fieldFilterToQuery(qb, condition);
                        } else {
                            //TODO support filter groups inside of filter groups
                        }
                    });
                })
            );
        }
        if (filterGroup.or && filterGroup.or.length > 0) {
            queryBuilder.orWhere(
                new Brackets((qb) => {
                    filterGroup.or.forEach((condition) => {
                        if (!this.isFilterGroup(condition)) {
                            this.fieldFilterToQuery(qb, condition);
                        } else {
                            //TODO support filter groups inside of filter groups
                        }
                    });
                })
            );
        }

        return queryBuilder;
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
