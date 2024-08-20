import { MigrationInterface, QueryRunner } from "typeorm";
import { ListGroupOptions } from "@tillywork/shared";

export class DeleteUserGroups1716372393939 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM list_group
            WHERE type = '${ListGroupOptions.ASSIGNEE}'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }
}
