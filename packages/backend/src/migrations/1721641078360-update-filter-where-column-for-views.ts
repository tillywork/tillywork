import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFilterWhereColumnForViews1721641078360
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        const filters = await queryRunner.query(
            `SELECT id, "where" FROM filter WHERE "entityType" = 'VIEW'`
        );

        for (const filter of filters) {
            const { id, where } = filter;
            const newWhere = { advanced: { and: [] }, quick: { and: [] } };

            if (where?.and) {
                for (const condition of where.and) {
                    if (condition.or) {
                        newWhere.quick.and.push(...condition.or);
                    } else {
                        newWhere.advanced.and.push(condition);
                    }
                }
            }

            await queryRunner.query(
                `UPDATE filter SET "where" = $1 WHERE id = $2`,
                [newWhere, id]
            );
        }
    }

    public async down(): Promise<void> {
        //
    }
}
