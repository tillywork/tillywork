import { ViewTypes } from "@tillywork/shared";
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnsToOptionsColumnInViewTable1724762987440
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get all views
        const views = await queryRunner.query(
            `SELECT * FROM "view" WHERE "type" = '${ViewTypes.TABLE}'`
        );

        for (const view of views) {
            // Get the associated list
            const list = (
                await queryRunner.query(`SELECT * FROM "list" WHERE id = $1`, [
                    view.listId,
                ])
            )[0];

            // Get list fields
            const listFields = await queryRunner.query(
                `
                SELECT f.* FROM "field" f
                JOIN "list_fields" fll ON f.id = fll."fieldId"
                WHERE fll."listId" = $1
            `,
                [list.id]
            );

            // Get card type fields
            const cardTypeFields = await queryRunner.query(
                `
                SELECT f.* FROM "field" f
                WHERE f."cardTypeId" = $1
            `,
                [list.defaultCardTypeId]
            );

            // Find title field
            const titleField = cardTypeFields.find((field) => field.isTitle);

            // Find pinned fields
            const pinnedFields = [
                ...listFields.filter((field) => field.isPinned),
                ...cardTypeFields.filter((field) => field.isPinned),
            ];

            // Create new columns array
            const columns = [
                titleField.id,
                ...pinnedFields.map((field) => field.id),
            ];

            // Update the view's options column
            await queryRunner.query(
                `
                UPDATE "view"
                SET options = jsonb_set(
                    CASE WHEN options IS NULL THEN '{}' ELSE options END,
                    '{columns}',
                    $1::jsonb
                )
                WHERE id = $2
            `,
                [JSON.stringify(columns), view.id]
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the 'columns' key from the options JSON for all views
        await queryRunner.query(`
            UPDATE "view"
            SET options = options - 'columns'
            WHERE options ? 'columns' AND "type" = '${ViewTypes.TABLE}'
        `);
    }
}
