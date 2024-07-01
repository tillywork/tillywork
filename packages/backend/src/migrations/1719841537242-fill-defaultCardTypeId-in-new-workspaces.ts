import { MigrationInterface, QueryRunner } from "typeorm";

export class FillDefaultCardTypeIdInNewWorkspaces1719841537242
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "workspace"
            SET "defaultCardTypeId" = ct."typeId"
            FROM (
                SELECT w.id as "workspaceId", ct."id" as "typeId"
                FROM "workspace" w
                INNER JOIN "card_type" ct ON ct."workspaceId" = w."id"
            ) as ct
            WHERE "workspace"."id" = ct."workspaceId" AND "workspace"."defaultCardTypeId" is null;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }
}
