import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class MakeListStageIdNullableInCardListTable1731495327851
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            "card_list",
            "listStageId",
            new TableColumn({
                name: "listStageId",
                type: "bigint",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            "card_list",
            "listStageId",
            new TableColumn({
                name: "listStageId",
                type: "bigint",
            })
        );
    }
}
