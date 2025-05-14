import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";
import { CardTypeLayout } from "@tillywork/shared";

export class AddTitleTemplateColumnToCardTypeTable1747217497149
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "card_type",
            new TableColumn({
                name: "titleTemplate",
                type: "varchar",
                length: "255",
                isNullable: true,
            })
        );

        await queryRunner.query(`
            UPDATE card_type 
            SET "titleTemplate" = '{{first_name}} {{last_name}}'
            WHERE name = 'Contact' 
            AND "createdByType" = 'system'
            AND layout = '${CardTypeLayout.PERSON}'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("card_type", "titleTemplate");
    }
}
