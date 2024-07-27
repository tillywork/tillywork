import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSlugColumnToWorkspaceTable1721624249053
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "workspace",
            new TableColumn({
                name: "slug",
                type: "varchar",
                isNullable: false,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("workspace", "slug");
    }
}
