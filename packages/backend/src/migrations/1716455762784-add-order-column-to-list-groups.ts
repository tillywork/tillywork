import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddOrderColumnToListGroups1716455762784
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "list_group",
            new TableColumn({
                name: "order",
                type: "int",
                isNullable: true,
            })
        );

        await queryRunner.query(
            `DELETE FROM list_group WHERE type = 'LIST_STAGE'`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("list_group", "order");
    }
}
