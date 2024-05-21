import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateViewTable1716299003967 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "view",
                columns: [
                    {
                        name: "id",
                        type: "bigint",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "type",
                        type: "enum",
                        enum: ["table", "board", "gantt", "calendar"],
                        default: `'table'`,
                    },
                    {
                        name: "groupBy",
                        type: "enum",
                        enum: ["ALL", "LIST_STAGE", "ASSIGNEES", "DUE_DATE"],
                        default: `'LIST_STAGE'`,
                    },
                    {
                        name: "sortBy",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "listId",
                        type: "bigint",
                        isNullable: false,
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["listId"],
                        referencedTableName: "list",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("view");
    }
}
