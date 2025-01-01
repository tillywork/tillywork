import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddHasChildCardsToCardTypeTable1735645745129
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "card_type",
            new TableColumn({
                name: "hasChildren",
                type: "boolean",
                default: false,
            })
        );

        await queryRunner.query(`
            UPDATE card_type ct
            SET "hasChildren" = true
            FROM workspace w
            WHERE ct."workspaceId" = w.id 
            AND w.type = 'project_management'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("card_type", "hasChildren");
    }
}
