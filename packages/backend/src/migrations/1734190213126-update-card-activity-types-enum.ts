import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateCardActivityTypesEnum1734190213126
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "card_activity",
            new TableColumn({
                name: "oldType",
                type: "varchar",
                isNullable: true,
            })
        );

        await queryRunner.query(`UPDATE card_activity SET "oldType" = "type"`);

        await queryRunner.dropColumn("card_activity", "type");

        await queryRunner.addColumn(
            "card_activity",
            new TableColumn({
                name: "type",
                type: "enum",
                enum: [
                    "update",
                    "comment",
                    "task",
                    "email",
                    "meeting",
                    "call",
                    "message",
                ],
                default: `'comment'`,
            })
        );

        await queryRunner.query(
            `UPDATE card_activity SET type = 'update' WHERE "oldType" = 'UPDATE'`
        );
        await queryRunner.query(
            `UPDATE card_activity SET type = 'comment' WHERE "oldType" = 'COMMENT'`
        );

        await queryRunner.changeColumn(
            "card_activity",
            "type",
            new TableColumn({
                name: "type",
                type: "enum",
                enum: [
                    "update",
                    "comment",
                    "task",
                    "email",
                    "meeting",
                    "call",
                    "message",
                ],
            })
        );

        await queryRunner.dropColumn("card_activity", "oldType");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        //
    }
}
