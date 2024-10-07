import { FieldTypes } from "@tillywork/shared";
import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class MigrateCardUsersToDataColumn1725792730053
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        //Clear list groups
        await queryRunner.query(`DELETE FROM list_group`);

        await queryRunner.addColumn(
            "field",
            new TableColumn({
                name: "isAssignee",
                type: "boolean",
                default: false,
            })
        );

        const cardTypes = await queryRunner.query(`
            SELECT id, "workspaceId" 
            FROM card_type 
          `);

        for (const cardType of cardTypes) {
            const defaultFields = [
                {
                    name: "Assignee",
                    slug: "assignee",
                    type: FieldTypes.USER,
                    icon: "mdi-account",
                    isAssignee: true,
                    isPinned: true,
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
                  INSERT INTO field (name, slug, icon, type, "cardTypeId", "workspaceId", "createdAt", "updatedAt", "createdByType", "isAssignee", "isPinned")
                  VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), 'system', $7, $8)
                `,
                        [
                            field.name,
                            field.slug,
                            field.icon,
                            field.type,
                            cardType.id,
                            cardType.workspaceId,
                            field.isAssignee ?? false,
                            field.isPinned ?? false,
                        ]
                    );
                }
            }
        }

        // Migrate data from card_users to data JSONB
        await queryRunner.query(`
            UPDATE card
            SET data = COALESCE(data, '{}'::jsonb) || jsonb_build_object(
                'assignee',
                (
                    SELECT jsonb_agg(CAST(cu."userId" AS TEXT))
                    FROM card_users cu
                    WHERE cu."cardId" = card.id
                )
            )
            WHERE EXISTS (
                SELECT 1
                FROM card_users cu
                WHERE cu."cardId" = card.id
            )
        `);

        // Drop the card_users table
        await queryRunner.dropTable("card_users");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate the old columns
        await queryRunner.createTable(
            new Table({
                name: "card_users",
                columns: [
                    {
                        name: "cardId",
                        type: "bigint",
                    },
                    {
                        name: "userId",
                        type: "bigint",
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["cardId"],
                        referencedTableName: "card",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                    {
                        columnNames: ["userId"],
                        referencedTableName: "user",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
            })
        );

        // Move data back from data JSONB to table
        await queryRunner.query(`
            INSERT INTO card_users ("cardId", "userId")
            SELECT 
                c.id AS "cardId",
                CAST(jsonb_array_elements_text(c.data->'assignee') AS bigint) AS "userId"
            FROM 
                card c
            WHERE 
                c.data ? 'assignee' AND jsonb_array_length(c.data->'assignee') > 0
        `);

        // Remove the migrated data from the data JSONB column
        await queryRunner.query(`
        UPDATE card
        SET data = data - 'assignee'
      `);

        const cardTypes = await queryRunner.query(`
            SELECT id 
            FROM card_type 
          `);

        for (const cardType of cardTypes) {
            await queryRunner.query(
                `
              DELETE FROM field 
              WHERE "cardTypeId" = $1 AND slug IN ('assignee')
            `,
                [cardType.id]
            );
        }

        await queryRunner.dropColumn("field", "isAssignee");
    }
}
