import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteDefaultListGroups1718022901852
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM list_group
            WHERE "type" = 'ALL'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }
}
