import { Injectable, Logger } from "@nestjs/common";
import { WhereExpressionBuilder, Brackets, SelectQueryBuilder } from "typeorm";
import {
    dayjs,
    FieldFilter,
    FilterGroup,
    FilterOperator,
} from "@tillywork/shared";

@Injectable()
export class QueryBuilderHelper {
    private static readonly logger = new Logger("QueryBuilderHelper");

    static isSafeFieldName(field: string): boolean {
        return /^([a-zA-Z_][a-zA-Z0-9_]*)(\.[a-zA-Z0-9_]+)*$/.test(field);
    }

    static processValue(value: any) {
        const utcDayjs = dayjs.utc;
        const datePlaceholders = {
            ":startOfDay": utcDayjs().startOf("day").toISOString(),
            ":endOfDay": utcDayjs().endOf("day").toISOString(),
            ":startOfYesterday": utcDayjs()
                .subtract(1, "day")
                .startOf("day")
                .toISOString(),
            ":endOfYesterday": utcDayjs()
                .subtract(1, "day")
                .endOf("day")
                .toISOString(),
            ":startOfTomorrow": utcDayjs()
                .add(1, "day")
                .startOf("day")
                .toISOString(),
            ":endOfTomorrow": utcDayjs()
                .add(1, "day")
                .endOf("day")
                .toISOString(),
            ":startOfLastWeek": utcDayjs()
                .subtract(1, "week")
                .startOf("week")
                .toISOString(),
            ":endOfLastWeek": utcDayjs()
                .subtract(1, "week")
                .endOf("week")
                .toISOString(),
            ":startOfWeek": utcDayjs().startOf("week").toISOString(),
            ":endOfWeek": utcDayjs().endOf("week").toISOString(),
            ":startOfNextWeek": utcDayjs()
                .add(1, "week")
                .startOf("week")
                .toISOString(),
            ":endOfNextWeek": utcDayjs()
                .add(1, "week")
                .endOf("week")
                .toISOString(),
            ":startOfLastMonth": utcDayjs()
                .subtract(1, "month")
                .startOf("month")
                .toISOString(),
            ":endOfLastMonth": utcDayjs()
                .subtract(1, "month")
                .endOf("month")
                .toISOString(),
            ":startOfMonth": utcDayjs().startOf("month").toISOString(),
            ":endOfMonth": utcDayjs().endOf("month").toISOString(),
            ":startOfNextMonth": utcDayjs()
                .add(1, "month")
                .startOf("month")
                .toISOString(),
            ":endOfNextMonth": utcDayjs()
                .add(1, "month")
                .endOf("month")
                .toISOString(),
            ":startOfLastYear": utcDayjs()
                .subtract(1, "year")
                .startOf("year")
                .toISOString(),
            ":endOfLastYear": utcDayjs()
                .subtract(1, "year")
                .endOf("year")
                .toISOString(),
            ":startOfYear": utcDayjs().startOf("year").toISOString(),
            ":endOfYear": utcDayjs().endOf("year").toISOString(),
            ":startOfNextYear": utcDayjs()
                .add(1, "year")
                .startOf("year")
                .toISOString(),
            ":endOfNextYear": utcDayjs()
                .add(1, "year")
                .endOf("year")
                .toISOString(),
            ":startOfTime": utcDayjs(0).toISOString(),
            ":endOfTime": utcDayjs("2500").toISOString(),
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

    static getRandomInt({ min = 1, max = Number.MAX_SAFE_INTEGER }) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
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

        if (!this.isSafeFieldName(field)) {
            throw new Error(
                `[QueryBuilderHelper] Disallowed or unsafe field: ${field}`
            );
        }

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
            case "neOrNull":
                return queryBuilder.andWhere(
                    `${fieldName} != :${field} OR ${fieldName} IS NULL`,
                    {
                        [field]: processedValue,
                    }
                );
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
                if (fieldName.startsWith(cardPrefix)) {
                    return queryBuilder.andWhere(
                        new Brackets((qb) =>
                            processedValue.map((value: string, i: number) => {
                                const paramName = `${field}_in_${i}`;
                                qb.orWhere(`${fieldName} @> :${paramName}`, {
                                    [paramName]: `["${value}"]`,
                                });
                            })
                        )
                    );
                }
                const paramNames = processedValue.map(
                    (_: any, i: number) => `:${field}_in_${i}`
                );
                const params = Object.fromEntries(
                    processedValue.map((v: any, i: number) => [
                        `${field}_in_${i}`,
                        v,
                    ])
                );
                return queryBuilder.andWhere(
                    `${fieldName} IN (${paramNames.join(",")})`,
                    params
                );
            }
            case "nin": {
                if (fieldName.startsWith(cardPrefix)) {
                    return queryBuilder
                        .andWhere(
                            new Brackets((qb) =>
                                processedValue.map(
                                    (value: string, i: number) => {
                                        const paramName = `${field}_nin_${i}`;
                                        qb.andWhere(
                                            `NOT (${fieldName} @> :${paramName})`,
                                            {
                                                [paramName]: `["${value}"]`,
                                            }
                                        );
                                    }
                                )
                            )
                        )
                        .orWhere(`${fieldName} IS NULL`);
                }
                const paramNames = processedValue.map(
                    (_: any, i: number) => `:${field}_nin_${i}`
                );
                const params = Object.fromEntries(
                    processedValue.map((v: any, i: number) => [
                        `${field}_nin_${i}`,
                        v,
                    ])
                );
                return queryBuilder.andWhere(
                    `${fieldName} NOT IN (${paramNames.join(",")})`,
                    params
                );
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
            case "nbetween": {
                const randomNumber1 = this.getRandomInt({});
                const randomNumber2 = randomNumber1 + 1;

                const betweenOperator = `${
                    operator[0] === "n" ? "NOT " : ""
                }BETWEEN`;

                return queryBuilder.andWhere(
                    `${fieldName} ${betweenOperator} :${field}${randomNumber1} AND :${field}${randomNumber2}`,
                    {
                        [`${field}${randomNumber1}`]: processedValue[0],
                        [`${field}${randomNumber2}`]: processedValue[1],
                    }
                );
            }
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
        queryBuilder: SelectQueryBuilder<any> | WhereExpressionBuilder,
        filterGroup: FilterGroup | FieldFilter,
        whereOperator: "and" | "or" = "and"
    ): SelectQueryBuilder<any> | WhereExpressionBuilder {
        queryBuilder[`${whereOperator}Where`](
            new Brackets((qb) => {
                if (this.isFilterGroup(filterGroup)) {
                    (filterGroup.and ?? []).forEach((condition) => {
                        this.buildQuery(qb, condition, "and");
                    });
                    (filterGroup.or ?? []).forEach((condition) => {
                        this.buildQuery(qb, condition, "or");
                    });
                } else {
                    this.fieldFilterToQuery(qb, filterGroup);
                }
            })
        );

        return queryBuilder;
    }

    static isFilterGroup(
        condition: FilterGroup | FieldFilter
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
