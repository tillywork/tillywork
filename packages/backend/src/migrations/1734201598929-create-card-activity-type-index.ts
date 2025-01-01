import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class CreateCardActivityTypeIndex1734201598929
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createIndex(
            "card_activity",
            new TableIndex({
                name: "IDX_CARD_ACTIVITY_TYPE",
                columnNames: ["type"],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex("card_activity", "IDX_CARD_ACTIVITY_TYPE");
    }
}
