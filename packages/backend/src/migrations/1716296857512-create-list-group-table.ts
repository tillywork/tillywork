import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from "typeorm";

export class CreateListGroupTable1716296857512 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "list_group",
                columns: [
                    {
                        name: "id",
                        type: "bigint",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    { name: "entityId", type: "bigint", isNullable: true },
                    {
                        name: "entityType",
                        type: "enum",
                        enum: ["LIST_STAGE", "USER"],
                        isNullable: true,
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "type",
                        type: "enum",
                        enum: ["ALL", "LIST_STAGE", "ASSIGNEES", "DUE_DATE"],
                        isNullable: false,
                    },
                    { name: "isExpanded", type: "boolean", default: true },
                    { name: "color", type: "varchar", isNullable: true },
                    { name: "icon", type: "varchar", isNullable: true },
                    { name: "listId", type: "bigint", isNullable: false },
                    { name: "createdAt", type: "timestamp", default: "now()" },
                    { name: "updatedAt", type: "timestamp", default: "now()" },
                ],
            })
        );

        await queryRunner.createForeignKey(
            "list_group",
            new TableForeignKey({
                columnNames: ["listId"],
                referencedColumnNames: ["id"],
                referencedTableName: "list",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("list_group");
        const foreignKey = table?.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("listId") !== -1
        );

        await queryRunner.dropForeignKey(
            "list_group",
            foreignKey as TableForeignKey
        );
        await queryRunner.dropTable("list_group");
    }
}
