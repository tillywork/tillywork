import { ListType } from "@tillywork/shared";
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddTypeColumnToListTable1729608774525
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "list",
            new TableColumn({
                name: "type",
                type: "varchar",
                default: `'${ListType.LIST}'`,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("list", "type");
    }
}
