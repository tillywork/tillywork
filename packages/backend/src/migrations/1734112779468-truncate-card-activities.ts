import { MigrationInterface, QueryRunner } from "typeorm";

export class TruncateCardActivities1734112779468 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`TRUNCATE TABLE card_activity`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }
}
