import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePropTable1716299140812 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("prop");
    }
}
