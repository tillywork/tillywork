import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
    TableIndex,
} from "typeorm";
import { ListGroupEntityTypes } from "../app/common/lists/types";
import { ListGroupOptions } from "@tillywork/shared";

export class AddFieldIdAndFilterToListGroupTable1723106937425
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("TRUNCATE list_group RESTART IDENTITY");

        await queryRunner.addColumns("list_group", [
            new TableColumn({
                name: "fieldId",
                type: "bigint",
                isNullable: true,
            }),
            new TableColumn({
                name: "filter",
                type: "jsonb",
                isNullable: true,
            }),
        ]);

        await queryRunner.createIndex(
            "list_group",
            new TableIndex({
                columnNames: ["fieldId"],
            })
        );

        await queryRunner.changeColumn(
            "list_group",
            "type",
            new TableColumn({
                name: "type",
                type: "enum",
                enum: Object.values(ListGroupOptions),
            })
        );

        await queryRunner.changeColumn(
            "list_group",
            "entityType",
            new TableColumn({
                name: "entityType",
                type: "enum",
                enum: Object.values(ListGroupEntityTypes),
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            "view",
            new TableColumn({
                name: "oldGroupBy",
                type: "varchar",
                isNullable: true,
            })
        );

        await queryRunner.query(`UPDATE view set "oldGroupBy" = "groupBy"`);

        await queryRunner.dropColumn(
            "view",
            "groupBy"
        );

        await queryRunner.addColumn(
            "view",
            new TableColumn({
                name: "groupBy",
                type: "enum",
                enum: Object.values(ListGroupOptions),
                isNullable: true,
            })
        );

        await queryRunner.query(
            `UPDATE view set "groupBy" = '${ListGroupOptions.LIST_STAGE}' WHERE "oldGroupBy" ILIKE 'LIST_STAGE' OR "oldGroupBy" ILIKE 'DUE_DATE'`
        );
        await queryRunner.query(
            `UPDATE view set "groupBy" = '${ListGroupOptions.ALL}' WHERE "oldGroupBy" ILIKE 'ALL'`
        );
        await queryRunner.query(
            `UPDATE view set "groupBy" = '${ListGroupOptions.ASSIGNEE}' WHERE "oldGroupBy" ILIKE 'ASSIGNEES' OR "oldGroupBy" ILIKE '${ListGroupOptions.ASSIGNEE}'`
        );

        await queryRunner.changeColumn(
            "view",
            "groupBy",
            new TableColumn({
                name: "groupBy",
                type: "enum",
                enum: Object.values(ListGroupOptions),
            })
        );

        await queryRunner.dropColumn("view", "oldGroupBy");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns("list_group", ["fieldId", "filter"]);
    }
}
