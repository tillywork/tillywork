import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddUserUploadLimitToProjectTable1720038998374
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "project",
            new TableColumn({
                name: "userUploadLimit",
                type: "bigint",
                default: 1024 * 1024 * 1024,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("project", "userUploadLimit");
    }
}
