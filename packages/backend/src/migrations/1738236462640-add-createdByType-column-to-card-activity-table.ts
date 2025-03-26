import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddCreatedByTypeColumnToCardActivityTable1738236462640
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "card_activity",
            new TableColumn({
                name: "createdByType",
                type: "varchar",
                default: "'system'",
            })
        );

        await queryRunner.changeColumn(
            "card_activity",
            "createdById",
            new TableColumn({
                name: "createdById",
                type: "bigint",
                isNullable: true,
            })
        );

        await queryRunner.query(
            `UPDATE card_activity SET "createdByType" = 'user'`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("card_activity", "createdByType");

        await queryRunner.query(
            'DELETE FROM card_activity WHERE "createdById" IS NULL'
        );
        await queryRunner.changeColumn(
            "card_activity",
            "createdById",
            new TableColumn({
                name: "createdById",
                type: "bigint",
            })
        );
    }
}
