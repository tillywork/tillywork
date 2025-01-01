import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContentIndexToCardActivity1734530224432
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE INDEX "IDX_CARD_ACTIVITY_CONTENT" ON "card_activity" USING gin ("content")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex(
            "card_activity",
            "IDX_CARD_ACTIVITY_CONTENT"
        );
    }
}
