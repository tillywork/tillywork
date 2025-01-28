import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddCurrencyColumnToWorkspaceTable1735134777269
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "workspace",
            new TableColumn({
                name: "currency",
                type: "varchar",
                length: "3",
                default: `'USD'`,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("workspace", "currency");
    }
}
