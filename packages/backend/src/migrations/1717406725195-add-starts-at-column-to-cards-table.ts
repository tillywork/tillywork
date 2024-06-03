import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddStartsAtColumnToCardsTable1717406725195
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "card",
            new TableColumn({
                name: "startsAt",
                type: "timestamp",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("card", "startsAt");
    }
}
