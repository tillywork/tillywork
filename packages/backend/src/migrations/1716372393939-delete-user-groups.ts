import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteUserGroups1716372393939 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM list_group
            WHERE type = 'ASSIGNEES'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }
}
