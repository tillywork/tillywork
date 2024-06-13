import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
    TableForeignKey,
} from "typeorm";

export class AddDefaultCardTypeIdColumnToListTable1718019537173
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "list",
            new TableColumn({
                name: "defaultCardTypeId",
                type: "bigint",
                isNullable: true,
            })
        );

        await queryRunner.query(`
            UPDATE "list"
            SET "defaultCardTypeId" = ct."typeId"
            FROM (
                SELECT l.id as "listId", ct."id" as "typeId"
                FROM "list" l
                INNER JOIN "space" s ON s."id" = l."spaceId"
                INNER JOIN "workspace" w ON w."id" = s."workspaceId"
                INNER JOIN "card_type" ct ON ct."workspaceId" = w."id"
            ) as ct
            WHERE "list"."id" = ct."listId";
        `);

        await queryRunner.changeColumn(
            "list",
            new TableColumn({
                name: "defaultCardTypeId",
                type: "bigint",
                isNullable: true,
            }),
            new TableColumn({
                name: "defaultCardTypeId",
                type: "bigint",
                isNullable: false,
            })
        );

        await queryRunner.createForeignKey(
            "list",
            new TableForeignKey({
                columnNames: ["defaultCardTypeId"],
                referencedTableName: "card_type",
                referencedColumnNames: ["id"],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("list", "defaultCardTypeId");
    }
}
