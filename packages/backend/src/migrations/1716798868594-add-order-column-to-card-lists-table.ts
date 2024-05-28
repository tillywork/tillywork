import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddOrderColumnToCardListsTable1716798868594
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "card_list",
            new TableColumn({
                name: "order",
                type: "int",
                default: 100,
            })
        );
        // Update the order based on listStageId
        await queryRunner.query(`
            UPDATE card_list AS cl
            SET "order" = subquery."order"
            FROM (
                SELECT
                    card_list.id,
                    ROW_NUMBER() OVER (PARTITION BY "listStageId" ORDER BY card_list.id ASC) * 100 AS "order"
                FROM card_list
                INNER JOIN card ON card.id = card_list."cardId"
                WHERE card."deletedAt" is null
            ) AS subquery
            WHERE cl.id = subquery.id
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("card_list", "order");
    }
}
