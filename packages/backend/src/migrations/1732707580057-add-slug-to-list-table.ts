import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";
import slugify from "slugify";

export class AddSlugToListTable1732707580057 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "list",
            new TableColumn({
                name: "slug",
                type: "varchar",
                length: "255",
                isNullable: true,
            })
        );

        await queryRunner.query(
            `DELETE FROM list WHERE "deletedAt" IS NOT NULL`
        );

        const lists = await queryRunner.query(
            `SELECT 
                l.id, 
                l.name, 
                COALESCE(l."workspaceId", s."workspaceId") AS "workspaceId"
            FROM 
                list l
            LEFT JOIN 
                space s ON l."spaceId" = s."workspaceId"`
        );

        const usedSlugs = new Map<string, Set<string>>();
        const listIdToSlug = new Map<number, string>();

        for (const list of lists) {
            const slug = slugify(list.name, {
                lower: true,
                replacement: "-",
                strict: true,
            });
            const workspaceId = list.workspaceId;

            if (!usedSlugs.has(workspaceId)) {
                usedSlugs.set(workspaceId, new Set());
            }

            let counter = 1;
            let uniqueSlug = slug;
            if (usedSlugs.get(workspaceId)) {
                while (usedSlugs.get(workspaceId)!.has(uniqueSlug)) {
                    uniqueSlug = `${slug}-${counter}`;
                    counter++;
                }

                usedSlugs.get(workspaceId)!.add(uniqueSlug);

                await queryRunner.query(
                    `UPDATE list SET slug = '${uniqueSlug}' WHERE id = ${list.id}`
                );

                listIdToSlug.set(list.id, uniqueSlug);
            }
        }

        await queryRunner.changeColumn(
            "list",
            "slug",
            new TableColumn({
                name: "slug",
                type: "varchar",
                length: "255",
                isNullable: false,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("list", "slug");
    }
}
