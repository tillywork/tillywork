import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCardActivityTable1716298912783
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "card_activity",
                columns: [
                    {
                        name: "id",
                        type: "bigint",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "cardId",
                        type: "bigint", // Assuming 'id' type in Card entity matches this
                        isNullable: false,
                    },
                    {
                        name: "type",
                        type: "enum",
                        enum: ["UPDATE", "COMMENT"],
                    },
                    {
                        name: "content",
                        type: "jsonb",
                    },
                    {
                        name: "createdById",
                        type: "bigint", // Adjust if your User entity id type differs
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
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
                        columnNames: ["createdById"],
                        referencedTableName: "user",
                        referencedColumnNames: ["id"],
                        onDelete: "SET NULL", // Change if different deletion policy is required
                    },
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("card_activity");
    }
}
