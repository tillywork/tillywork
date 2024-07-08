import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

const iconColumnProperties = {
    name: "icon",
    type: "varchar",
    length: "255",
    isNullable: true,
};
const tables = ["space", "list"];

export class AddIconColumnToSpaceAndListTables1720414956770
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await Promise.all(
            tables.map((table) =>
                queryRunner.addColumn(
                    table,
                    new TableColumn(iconColumnProperties)
                )
            )
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await Promise.all(
            tables.map((table) => queryRunner.dropColumn(table, "icon"))
        );
    }
}
