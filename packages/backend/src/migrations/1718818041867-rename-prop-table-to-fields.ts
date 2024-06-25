import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { FieldTypes } from "../app/common/fields/types";

export class RenamePropTableToFields1718818041867
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "field",
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
                        enum: Object.values(FieldTypes),
                    },
                    {
                        name: "icon",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "required",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "multiple",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "items",
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
                        name: "deletedAt",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "workspaceId",
                        type: "bigint",
                        isNullable: false,
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["workspaceId"],
                        referencedTableName: "workspace",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
            })
        );

        await queryRunner.dropTable("prop");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "prop",
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
                        enum: [
                            "TEXT",
                            "TEXT_AREA",
                            "DROPDOWN",
                            "LABEL",
                            "USER",
                            "DATE",
                            "NUMBER",
                            "CHECKBOX",
                            "EMAIL",
                            "URL",
                            "CURRENCY",
                        ],
                    },
                    {
                        name: "required",
                        type: "boolean",
                        default: false,
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

        await queryRunner.dropTable("field");
    }
}
