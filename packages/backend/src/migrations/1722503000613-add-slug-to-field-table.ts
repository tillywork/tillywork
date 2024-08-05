import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";
import slugify from "slugify";

export class AddSlugToFieldTable1722503000613 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "field",
            new TableColumn({
                name: "slug",
                type: "varchar",
                length: "255",
                isNullable: true,
            })
        );

        // Delete deleted fields
        await queryRunner.query(
            `DELETE FROM field WHERE "deletedAt" IS NOT NULL`
        );

        // Fetch all fields with their workspaceId
        const fields = await queryRunner.query(
            `SELECT id, name, "workspaceId" FROM field`
        );

        // Create a map to store used slugs per workspace
        const usedSlugs = new Map<string, Set<string>>();
        // Create a map to store field id to slug mapping
        const fieldIdToSlug = new Map<string, string>();

        for (const field of fields) {
            const slug = slugify(field.name, {
                lower: true,
                replacement: "_",
                strict: true,
            });
            const workspaceId = field.workspaceId;

            // Initialize the set of used slugs for this workspace if it doesn't exist
            if (!usedSlugs.has(workspaceId)) {
                usedSlugs.set(workspaceId, new Set());
            }

            // Ensure the slug is unique within the workspace
            let counter = 1;
            let uniqueSlug = slug;
            if (usedSlugs.get(workspaceId)) {
                while (usedSlugs.get(workspaceId)!.has(uniqueSlug)) {
                    uniqueSlug = `${slug}_${counter}`;
                    counter++;
                }

                // Add the unique slug to the set of used slugs for this workspace
                usedSlugs.get(workspaceId)!.add(uniqueSlug);

                // Update the field with the unique slug
                await queryRunner.query(
                    `UPDATE field SET slug = '${uniqueSlug}' WHERE id = ${field.id}`
                );

                // Store the field id to slug mapping
                fieldIdToSlug.set(field.id.toString(), uniqueSlug);
            }
        }

        await queryRunner.changeColumn(
            "field",
            "slug",
            new TableColumn({
                name: "slug",
                type: "varchar",
                length: "255",
                isNullable: false,
            })
        );

        // Update card data to use slugs instead of field IDs
        const cards = await queryRunner.query(`SELECT id, data FROM card`);
        for (const card of cards) {
            const newData: any = {};
            for (const [fieldId, value] of Object.entries(card.data)) {
                const slug = fieldIdToSlug.get(fieldId);
                if (slug) {
                    newData[slug] = value;
                } else {
                    newData[fieldId] = value; // Keep the original key if no matching slug is found
                }
            }
            await queryRunner.query(
                `UPDATE card SET data = '${JSON.stringify(
                    newData
                )}' WHERE id = ${card.id}`
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert card data to use field IDs instead of slugs
        const fields = await queryRunner.query(`SELECT id, slug FROM field`);
        const slugToFieldId = new Map(
            fields.map((f: any) => [f.slug, f.id.toString()])
        );

        const cards = await queryRunner.query(`SELECT id, data FROM card`);
        for (const card of cards) {
            const newData: any = {};
            for (const [key, value] of Object.entries(card.data)) {
                const fieldId: number = slugToFieldId.get(key) as number;
                if (fieldId) {
                    newData[fieldId] = value;
                } else {
                    newData[key] = value; // Keep the original key if no matching field ID is found
                }
            }
            await queryRunner.query(
                `UPDATE card SET data = '${JSON.stringify(
                    newData
                )}' WHERE id = ${card.id}`
            );
        }

        await queryRunner.dropColumn("field", "slug");
    }
}
