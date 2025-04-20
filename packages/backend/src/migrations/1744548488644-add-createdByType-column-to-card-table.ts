import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddCreatedByTypeColumnToCardTable1744548488644
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "card",
            new TableColumn({
                name: "createdByType",
                type: "varchar",
                default: "'system'",
            })
        );

        await queryRunner.changeColumn(
            "card",
            "createdById",
            new TableColumn({
                name: "createdById",
                type: "bigint",
                isNullable: true,
            })
        );

        await queryRunner.query(`UPDATE card SET "createdByType" = 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("card", "createdByType");

        await queryRunner.query('DELETE FROM card WHERE "createdById" IS NULL');
        await queryRunner.changeColumn(
            "card",
            "createdById",
            new TableColumn({
                name: "createdById",
                type: "bigint",
            })
        );
    }
}
