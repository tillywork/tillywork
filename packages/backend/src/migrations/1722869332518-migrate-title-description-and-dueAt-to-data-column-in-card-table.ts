import { FieldTypes } from "@tillywork/shared";
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class MigrateTitleDescriptionAndDueAtToDataColumnInCardTable1722869332518
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        const cardTypes = await queryRunner.query(`
            SELECT id, "workspaceId" 
            FROM card_type 
          `);

        for (const cardType of cardTypes) {
            const defaultFields = [
                {
                    name: "Title",
                    slug: "title",
                    type: FieldTypes.RICH,
                    icon: "mdi-text-recognition",
                    isTitle: true,
                },
                {
                    name: "Description",
                    slug: "description",
                    type: FieldTypes.RICH,
                    icon: "mdi-text-box",
                    isDescription: true,
                },
                {
                    name: "Due At",
                    slug: "due_at",
                    type: FieldTypes.DATE,
                    icon: "mdi-calendar",
                    isPinned: true,
                },
                {
                    name: "Starts At",
                    slug: "starts_at",
                    type: FieldTypes.DATE,
                    icon: "mdi-calendar",
                },
            ];

            for (const field of defaultFields) {
                // Check if the field already exists
                const existingField = await queryRunner.query(
                    `
                SELECT id FROM field 
                WHERE "cardTypeId" = $1 AND slug = $2
              `,
                    [cardType.id, field.slug]
                );

                if (existingField.length === 0) {
                    // If the field doesn't exist, create it
                    await queryRunner.query(
                        `
                  INSERT INTO field (name, slug, icon, type, "cardTypeId", "workspaceId", "createdAt", "updatedAt", "createdByType", "isTitle", "isDescription", "isPinned")
                  VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), 'system', $7, $8, $9)
                `,
                        [
                            field.name,
                            field.slug,
                            field.icon,
                            field.type,
                            cardType.id,
                            cardType.workspaceId,
                            field.isTitle ?? false,
                            field.isDescription ?? false,
                            field.isPinned ?? false,
                        ]
                    );
                }
            }
        }

        // Migrate data from columns to data JSONB
        await queryRunner.query(`
        UPDATE card
        SET data = data || jsonb_build_object(
          'title', title,
          'description', CASE 
            WHEN description IS NULL THEN NULL
            WHEN description::jsonb IS NULL THEN to_jsonb(description)
            ELSE description::jsonb
          END,
          'due_at', "dueAt",
          'starts_at', "startsAt"
        )
        WHERE title IS NOT NULL OR description IS NOT NULL OR "dueAt" IS NOT NULL OR "startsAt" IS NOT NULL
      `);

        // Drop the old columns
        await queryRunner.dropColumn("card", "title");
        await queryRunner.dropColumn("card", "description");
        await queryRunner.dropColumn("card", "dueAt");
        await queryRunner.dropColumn("card", "startsAt");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate the old columns
        await queryRunner.addColumn(
            "card",
            new TableColumn({
                name: "title",
                type: "varchar",
                isNullable: true,
            })
        );
        await queryRunner.addColumn(
            "card",
            new TableColumn({
                name: "description",
                type: "text",
                isNullable: true,
            })
        );
        await queryRunner.addColumn(
            "card",
            new TableColumn({
                name: "dueAt",
                type: "timestamp",
                isNullable: true,
            })
        );
        await queryRunner.addColumn(
            "card",
            new TableColumn({
                name: "startsAt",
                type: "timestamp",
                isNullable: true,
            })
        );

        // Move data back from data JSONB to columns
        await queryRunner.query(`
        UPDATE card
        SET 
          title = data->>'title',
          description = data->>'description',
          "dueAt" = (data->>'due_at')::timestamp,
          "startsAt" = (data->>'starts_at')::timestamp
      `);

        // Remove the migrated data from the data JSONB column
        await queryRunner.query(`
        UPDATE card
        SET data = data - 'title' - 'description' - 'due_at' - 'starts_at'
      `);

        const cardTypes = await queryRunner.query(`
            SELECT id 
            FROM card_type 
          `);

        for (const cardType of cardTypes) {
            await queryRunner.query(
                `
              DELETE FROM field 
              WHERE "cardTypeId" = $1 AND slug IN ('title', 'description', 'due_at')
            `,
                [cardType.id]
            );
        }
    }
}
