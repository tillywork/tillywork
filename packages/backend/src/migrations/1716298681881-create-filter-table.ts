import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateFilterTable1716298681881 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "filter",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "where",
                        type: "jsonb",
                    },
                    {
                        name: "entityId",
                        type: "bigint",
                    },
                    {
                        name: "entityType",
                        type: "enum",
                        enum: ["VIEW", "LIST_GROUP"],
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
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("filter");
    }
}
