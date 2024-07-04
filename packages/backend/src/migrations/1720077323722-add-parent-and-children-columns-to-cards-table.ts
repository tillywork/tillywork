import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
    TableForeignKey,
} from "typeorm";

export class AddParentAndChildrenColumnsToCardsTable1720077323722
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Adds the `parentCardId` column.
        await queryRunner.addColumn(
            "card",
            new TableColumn({
                name: "parentCardId",
                type: "int",
                isNullable: true,
            })
        );

        // Creates the foreign key relationship.
        await queryRunner.createForeignKey(
            "card",
            new TableForeignKey({
                columnNames: ["parentCardId"],
                referencedColumnNames: ["id"],
                referencedTableName: "card",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drops the foreign key.
        const table = await queryRunner.getTable("card");
        const foreignKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("parentCardId") !== -1
        );
        await queryRunner.dropForeignKey("card", foreignKey);

        // Drops the `parentCardId` column.
        await queryRunner.dropColumn("card", "parentCardId");
    }
}
