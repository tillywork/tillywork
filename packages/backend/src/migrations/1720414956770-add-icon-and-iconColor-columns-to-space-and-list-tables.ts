import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

const iconColumnProperties = {
    name: "icon",
    type: "varchar",
    length: "255",
};
const iconColorColumnProperties = {
    name: "iconColor",
    type: "varchar",
    length: "255",
    default: `'default'`,
};
const tables = ["space", "list"];

export class AddIconAndIconColorColumnsToSpaceAndListTables1720414956770
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await Promise.all([
            queryRunner.addColumns("space", [
                new TableColumn({
                    ...iconColumnProperties,
                    default: `'mdi-folder-outline'`,
                }),
                new TableColumn(iconColorColumnProperties),
            ]),
            queryRunner.addColumns("list", [
                new TableColumn({
                    ...iconColumnProperties,
                    default: `'mdi-list-box-outline'`,
                }),
                new TableColumn(iconColorColumnProperties),
            ]),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await Promise.all(
            tables.map((table) =>
                queryRunner.dropColumns(table, ["icon", "iconColor"])
            )
        );
    }
}
