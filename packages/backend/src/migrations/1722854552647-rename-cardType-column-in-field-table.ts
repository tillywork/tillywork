import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
    TableForeignKey,
} from "typeorm";

export class RenameCardTypeColumnInFieldTable1722854552647
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn("field", "cardTypeId", "dataCardTypeId");
        await queryRunner.addColumn(
            "field",
            new TableColumn({
                name: "cardTypeId",
                type: "bigint",
                isNullable: true,
            })
        );

        await queryRunner.createForeignKey(
            "field",
            new TableForeignKey({
                name: "FK_FIELD_DATA_CARD_TYPE",
                columnNames: ["dataCardTypeId"],
                referencedColumnNames: ["id"],
                referencedTableName: "card_type",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey("field", "FK_FIELD_DATA_CARD_TYPE");
        await queryRunner.dropColumn("field", "cardTypeId");
        await queryRunner.renameColumn("field", "dataCardTypeId", "cardTypeId");
    }
}
