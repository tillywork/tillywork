import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from "typeorm";

export class CreateSpaceTable1716296651114 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "space",
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
                    { name: "workspaceId", type: "bigint", isNullable: false },
                    { name: "createdAt", type: "timestamp", default: "now()" },
                    { name: "updatedAt", type: "timestamp", default: "now()" },
                    { name: "deletedAt", type: "timestamp", isNullable: true },
                ],
            })
        );

        await queryRunner.createForeignKey(
            "space",
            new TableForeignKey({
                columnNames: ["workspaceId"],
                referencedColumnNames: ["id"],
                referencedTableName: "workspace",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const spaceTable = await queryRunner.getTable("space");
        const workspaceForeignKey = spaceTable?.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("workspaceId") !== -1
        );

        await queryRunner.dropForeignKey(
            "space",
            workspaceForeignKey as TableForeignKey
        );
        await queryRunner.dropTable("space");
    }
}
