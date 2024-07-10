import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddIgnoreChildrenToViewTable1720514522438
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "view",
            new TableColumn({
                name: "ignoreChildren",
                type: "boolean",
                default: false,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("view", "ignoreChildren");
    }
}
