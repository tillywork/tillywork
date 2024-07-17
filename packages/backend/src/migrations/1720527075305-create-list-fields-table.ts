import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateListFieldsTable1720527075305 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "list_fields",
                columns: [
                    {
                        name: "fieldId",
                        type: "bigint",
                        isPrimary: true,
                    },
                    {
                        name: "listId",
                        type: "bigint",
                        isPrimary: true,
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["fieldId"],
                        referencedTableName: "field",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
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
        await queryRunner.dropTable("list_fields");
    }
}
