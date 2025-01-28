import { MigrationInterface, QueryRunner } from "typeorm";

export class FixDescriptionAndDueAtFields1726391466764
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `UPDATE field SET "isPinned" = true WHERE slug = 'due_at' AND "createdByType" = 'system'`
        );
        await queryRunner.query(
            `UPDATE field SET "isDescription" = true WHERE slug = 'description' AND "createdByType" = 'system'`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }
}
