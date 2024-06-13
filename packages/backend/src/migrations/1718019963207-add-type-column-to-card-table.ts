import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
    TableForeignKey,
} from "typeorm";

export class AddTypeColumnToCardTable1718019963207
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "card",
            new TableColumn({
                name: "typeId",
                type: "bigint",
                isNullable: true,
            })
        );

        await queryRunner.query(`
            UPDATE "card"
            SET "typeId" = ct."cardTypeId"
            FROM (
                SELECT c.id as "cardId", ct."id" as "cardTypeId"
                FROM "card" c
                INNER JOIN "card_list" cl ON cl."cardId" = c."id"
                INNER JOIN "list" l on l."id" = cl."listId"
                INNER JOIN "card_type" ct ON ct."id" = l."defaultCardTypeId"
            ) as ct
            WHERE "card"."id" = ct."cardId";
        `);

        await queryRunner.changeColumn(
            "card",
            new TableColumn({
                name: "typeId",
                type: "bigint",
                isNullable: true,
            }),
            new TableColumn({
                name: "typeId",
                type: "bigint",
                isNullable: false,
            })
        );

        await queryRunner.createForeignKey(
            "card",
            new TableForeignKey({
                columnNames: ["typeId"],
                referencedTableName: "card_type",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("card", "typeId");
    }
}
