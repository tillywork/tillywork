import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
    TableForeignKey,
} from "typeorm";

export class AddDefaultCardTypeToWorkspaceTable1718184687469
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "workspace",
            new TableColumn({
                name: "defaultCardTypeId",
                type: "bigint",
                isNullable: true,
            })
        );

        await queryRunner.query(`
            UPDATE "workspace"
            SET "defaultCardTypeId" = ct."typeId"
            FROM (
                SELECT w.id as "workspaceId", ct."id" as "typeId"
                FROM "workspace" w
                INNER JOIN "card_type" ct ON ct."workspaceId" = w."id"
            ) as ct
            WHERE "workspace"."id" = ct."workspaceId";
        `);

        await queryRunner.createForeignKey(
            "workspace",
            new TableForeignKey({
                columnNames: ["defaultCardTypeId"],
                referencedTableName: "card_type",
                referencedColumnNames: ["id"],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("workspace", "defaultCardTypeId");
    }
}
