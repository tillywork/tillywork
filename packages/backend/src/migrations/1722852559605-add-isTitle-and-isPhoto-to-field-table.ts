import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddIsTitleAndIsPhotoToFieldTable1722852559605
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "field",
            new TableColumn({
                name: "isTitle",
                type: "boolean",
                default: false,
            })
        );

        await queryRunner.addColumn(
            "field",
            new TableColumn({
                name: "isPhoto",
                type: "boolean",
                default: false,
            })
        );

        await queryRunner.addColumn(
            "field",
            new TableColumn({
                name: "isDescription",
                type: "boolean",
                default: false,
            })
        );

        await queryRunner.addColumn(
            "field",
            new TableColumn({
                name: "isPinned",
                type: "boolean",
                default: false,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("field", "isTitle");
        await queryRunner.dropColumn("field", "isPhoto");
        // await queryRunner.dropColumn("field", "isDescription");
        // await queryRunner.dropColumn("field", "isPinned");
    }
}
