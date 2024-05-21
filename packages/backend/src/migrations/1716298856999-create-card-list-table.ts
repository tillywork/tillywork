import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCardListTable1716298856999 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "card_list",
                columns: [
                    {
                        name: "id",
                        type: "bigint",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "listStageId",
                        type: "bigint",
                        isNullable: false,
                    },
                    {
                        name: "cardId",
                        type: "bigint",
                        isNullable: false,
                    },
                    {
                        name: "listId",
                        type: "bigint",
                        isNullable: false,
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["listStageId"],
                        referencedTableName: "list_stage",
                        referencedColumnNames: ["id"],
                        onDelete: "NO ACTION",
                    },
                    {
                        columnNames: ["cardId"],
                        referencedTableName: "card",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                    {
                        columnNames: ["listId"],
                        referencedTableName: "list",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("card_list");
    }
}
