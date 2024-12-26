import { FieldTypes } from "@tillywork/shared";
import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
    TableForeignKey,
} from "typeorm";

export class AddCardTypeIdToFieldTable1721214304859
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
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
                columnNames: ["cardTypeId"],
                referencedTableName: "card_type",
                referencedColumnNames: ["id"],
            })
        );

        await queryRunner.changeColumn(
            "field",
            "type",
            new TableColumn({
                name: "type",
                type: "enum",
                enum: Object.values(FieldTypes),
            })
        );

        await queryRunner.changeColumn(
            "field",
            "multiple",
            new TableColumn({
                name: "multiple",
                type: "boolean",
                default: false,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("field", "cardTypeId");
    }
}
