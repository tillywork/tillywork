import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddAccessTypeToWorkspaceSpaceListAndCardTables1733166524606
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        const accessTypeColumn = new TableColumn({
            name: "accessType",
            type: "enum",
            enum: ["public", "private", "only_me"],
            default: `'public'`,
        });

        await queryRunner.addColumn("workspace", accessTypeColumn);
        await queryRunner.addColumn("space", accessTypeColumn);
        await queryRunner.addColumn("list", accessTypeColumn);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("workspace", "accessType");
        await queryRunner.dropColumn("space", "accessType");
        await queryRunner.dropColumn("list", "accessType");
    }
}
