import { MigrationInterface, QueryRunner } from "typeorm";

export class ResetListGroups1719846270867 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.clearTable("list_group");
        await queryRunner.query(`
            DELETE FROM filter
            WHERE entityType = 'LIST_GROUP';    
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }
}
