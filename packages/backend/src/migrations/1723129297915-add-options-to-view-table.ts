import { ListGroupOptions } from "@tillywork/shared";
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddOptionsToViewTable1723129297915 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "view",
            new TableColumn({
                name: "options",
                type: "jsonb",
                default: `json_build_object('groupBy', '${ListGroupOptions.LIST_STAGE}', 'hideCompleted', true)`,
            })
        );

        await queryRunner.query(`
            UPDATE "view"
            SET "options" = json_build_object(
                'groupBy', json_build_object('type', "groupBy"),
                'sortBy', "sortBy",
                'hideCompleted', "ignoreCompleted",
                'hideChildren', "ignoreChildren"
            );
        `);

        await queryRunner.dropColumn("view", "groupBy");
        await queryRunner.dropColumn("view", "sortBy");
        await queryRunner.dropColumn("view", "ignoreCompleted");
        await queryRunner.dropColumn("view", "ignoreChildren");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "view",
            new TableColumn({
                name: "groupBy",
                type: "enum",
                enum: Object.values(ListGroupOptions),
                default: ListGroupOptions.LIST_STAGE,
            })
        );

        await queryRunner.addColumn(
            "view",
            new TableColumn({
                name: "sortBy",
                type: "jsonb",
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            "view",
            new TableColumn({
                name: "ignoreCompleted",
                type: "boolean",
                default: true,
            })
        );

        await queryRunner.addColumn(
            "view",
            new TableColumn({
                name: "ignoreChildren",
                type: "boolean",
                default: false,
            })
        );

        await queryRunner.query(`
            UPDATE "view"
            SET
                "groupBy" = '${ListGroupOptions.LIST_STAGE}',
                "sortBy" = ("options" ->> 'sortBy')::jsonb,
                "ignoreCompleted" = COALESCE(("options" ->> 'hideCompleted')::boolean, false),
                "ignoreChildren" = COALESCE(("options" ->> 'hideChildren')::boolean, false)
        `);
        await queryRunner.dropColumn("view", "options");
    }
}
