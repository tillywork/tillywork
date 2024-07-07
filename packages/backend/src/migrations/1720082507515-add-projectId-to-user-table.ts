import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
    TableForeignKey,
} from "typeorm";

export class AddProjectIdToUserTable1720082507515
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "user",
            new TableColumn({
                name: "projectId",
                type: "bigint",
                isNullable: true,
            })
        );

        await queryRunner.createForeignKey(
            "user",
            new TableForeignKey({
                columnNames: ["projectId"],
                referencedTableName: "project",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("user", "projectId");
    }
}
