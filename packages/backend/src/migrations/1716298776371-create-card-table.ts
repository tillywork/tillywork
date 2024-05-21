import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCardTable1716298776371 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "card",
                columns: [
                    {
                        name: "id",
                        type: "bigint",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "title",
                        type: "varchar",
                    },
                    {
                        name: "description",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "dueAt",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "data",
                        type: "jsonb",
                        default: `'{}'::jsonb`,
                    },
                    {
                        name: "createdById",
                        type: "bigint",
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
                        name: "deletedAt",
                        type: "timestamp",
                        isNullable: true,
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["createdById"],
                        referencedTableName: "user",
                        referencedColumnNames: ["id"],
                    },
                ],
            })
        );

        // Create the join table for Card and User (ManyToMany)
        await queryRunner.createTable(
            new Table({
                name: "card_users",
                columns: [
                    {
                        name: "cardId",
                        type: "bigint",
                    },
                    {
                        name: "userId",
                        type: "bigint", // adjust according to your user id type
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["cardId"],
                        referencedTableName: "card",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                    {
                        columnNames: ["userId"],
                        referencedTableName: "user",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("card_users");
        await queryRunner.dropTable("card");
    }
}
