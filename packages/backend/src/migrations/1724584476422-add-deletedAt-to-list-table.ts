import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddDeletedAtToListTable1724584476422
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "list",
            new TableColumn({
                name: "deletedAt",
                type: "timestamp",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("list", "deletedAt");
    }
}
