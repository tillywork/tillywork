import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
    TableForeignKey,
    TableIndex,
} from "typeorm";

export class AddWorkspaceIdToListTable1721829339753
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "list",
            new TableColumn({
                name: "workspaceId",
                type: "bigint",
                isNullable: true,
            })
        );

        await queryRunner.createForeignKey(
            "list",
            new TableForeignKey({
                columnNames: ["workspaceId"],
                referencedTableName: "workspace",
                referencedColumnNames: ["id"],
            })
        );

        await queryRunner.createIndex(
            "list",
            new TableIndex({
                columnNames: ["workspaceId"],
            })
        );

        await queryRunner.changeColumn(
            "list",
            "spaceId",
            new TableColumn({
                name: "spaceId",
                type: "bigint",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("list", "workspaceId");

        await queryRunner.changeColumn(
            "list",
            "spaceId",
            new TableColumn({
                name: "spaceId",
                type: "bigint",
                isNullable: false,
            })
        );
    }
}
