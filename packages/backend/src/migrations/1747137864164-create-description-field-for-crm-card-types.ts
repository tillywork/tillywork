import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDescriptionFieldForCrmCardTypes1747137864164
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Select card types with createdByType = 'system' and workspace.type = 'crm'
        // that do NOT have a field with isDescription = true
        const cardTypesWithoutDescription = await queryRunner.query(`
      SELECT ct.id, ct."workspaceId"
      FROM "card_type" ct
      INNER JOIN "workspace" w ON w.id = ct."workspaceId"
      WHERE ct."createdByType" = 'system'
        AND w.type = 'crm'
        AND NOT EXISTS (
          SELECT 1 FROM "field" f
          WHERE f."cardTypeId" = ct.id
            AND f."isDescription" = true
            AND f."deletedAt" IS NULL
        )
        AND ct."deletedAt" IS NULL
    `);

        for (const cardType of cardTypesWithoutDescription) {
            await queryRunner.query(
                `
        INSERT INTO "field" (
          name,
          type,
          "isDescription",
          icon,
          "createdByType",
          "workspaceId",
          slug,
          "cardTypeId",
          "isTitle",
          "isPhoto",
          "isAssignee",
          "isPinned",
          required,
          multiple,
          "createdAt",
          "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          false, false, false, false, false, true,
          NOW(), NOW()
        )
      `,
                [
                    "Description", // name
                    "rich", // type
                    true, // isDescription
                    "mdi-text-box", // icon
                    "system", // createdByType
                    cardType.workspaceId, // workspaceId
                    "description", // slug
                    cardType.id, // cardTypeId
                ]
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the description fields created by this migration
        await queryRunner.query(`
      DELETE FROM "field"
      WHERE slug = 'description'
        AND "isDescription" = true
        AND "createdByType" = 'system'
    `);
    }
}
