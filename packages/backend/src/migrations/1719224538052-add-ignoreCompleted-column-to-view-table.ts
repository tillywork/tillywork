import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddIgnoreCompletedColumnToViewTable1719224538052
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "view",
            new TableColumn({
                name: "ignoreCompleted",
                type: "bool",
                default: false,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("view", "ignoreCompleted");
    }
}
