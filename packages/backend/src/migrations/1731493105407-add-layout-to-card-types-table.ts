import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddLayoutToCardTypesTable1731493105407
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "card_type",
            new TableColumn({
                name: "layout",
                type: "enum",
                enum: ["default", "person", "organization"],
                default: `'default'`,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("card_type", "layout");
    }
}
