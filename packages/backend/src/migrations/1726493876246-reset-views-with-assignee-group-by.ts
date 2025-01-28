import { MigrationInterface, QueryRunner } from "typeorm";

export class ResetViewsWithAssigneeGroupBy1726493876246
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "view"
            SET options = jsonb_set(
                options,
                '{groupBy,type}',
                '"all"'::jsonb,
                true
            )
            WHERE (options -> 'groupBy' ->> 'type') = 'assignee'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }
}
