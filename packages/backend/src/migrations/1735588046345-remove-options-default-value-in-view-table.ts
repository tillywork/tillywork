import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveOptionsDefaultValueInViewTable1735588046345
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE view ALTER COLUMN options SET DEFAULT json_build_object();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE view ALTER COLUMN options SET DEFAULT json_build_object('groupBy', json_build_object('type', 'list_stage'), 'hideCompleted', true);
        `);
    }
}
