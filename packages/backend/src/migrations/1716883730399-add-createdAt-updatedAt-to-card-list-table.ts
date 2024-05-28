import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddCreatedAtUpdatedAtToCardListTable1716883730399
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns("card_list", [
            new TableColumn({
                name: "createdAt",
                type: "timestamp",
                default: "now()",
            }),
            new TableColumn({
                name: "updatedAt",
                type: "timestamp",
                default: "now()",
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns("card_list", ["createdAt", "updatedAt"]);
    }
}
