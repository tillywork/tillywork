import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from "typeorm";

export class CreateListTable1716296739540 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "list",
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
                        isNullable: false,
                    },
                    { name: "spaceId", type: "bigint", isNullable: false },
                    { name: "createdAt", type: "timestamp", default: "now()" },
                    { name: "updatedAt", type: "timestamp", default: "now()" },
                ],
            })
        );

        await queryRunner.createForeignKey(
            "list",
            new TableForeignKey({
                columnNames: ["spaceId"],
                referencedColumnNames: ["id"],
                referencedTableName: "space",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const listTable = await queryRunner.getTable("list");
        const foreignKey = listTable?.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("spaceId") !== -1
        );

        await queryRunner.dropForeignKey("list", foreignKey as TableForeignKey);
        await queryRunner.dropTable("list");
    }
}
