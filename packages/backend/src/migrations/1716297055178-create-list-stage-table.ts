import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateListStageTable1716297055178 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "list_stage",
                columns: [
                    {
                        name: "id",
                        type: "bigint",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "color",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "order",
                        type: "int",
                    },
                    {
                        name: "isCompleted",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "listId",
                        type: "bigint",
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["listId"],
                        referencedTableName: "list",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
                indices: [
                    {
                        name: "IDX_list_stage_name",
                        columnNames: ["name"],
                    },
                    {
                        name: "IDX_list_stage_color",
                        columnNames: ["color"],
                    },
                    {
                        name: "IDX_list_stage_order",
                        columnNames: ["order"],
                    },
                    {
                        name: "IDX_list_stage_createdAt",
                        columnNames: ["createdAt"],
                    },
                    {
                        name: "IDX_list_stage_updatedAt",
                        columnNames: ["updatedAt"],
                    },
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("list_stage");
    }
}
