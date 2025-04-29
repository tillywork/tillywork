import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableUnique,
    TableForeignKey,
} from "typeorm";

export class CreateUserIntegrationTable1745839604390
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "user_integration",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "uuid",
                    },
                    { name: "userId", type: "bigint", isNullable: false },
                    {
                        name: "type",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "config",
                        type: "jsonb",
                        isNullable: false,
                        default: "'{}'",
                    },
                    { name: "createdAt", type: "timestamp", default: "now()" },
                    { name: "updatedAt", type: "timestamp", default: "now()" },
                ],
            }),
            true
        );

        await queryRunner.createUniqueConstraint(
            "user_integration",
            new TableUnique({
                name: "UQ_USER_INTEGRATION_USER_TYPE",
                columnNames: ["userId", "type"],
            })
        );

        await queryRunner.createForeignKey(
            "user_integration",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedTableName: "user",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropUniqueConstraint(
            "user_integration",
            "UQ_USER_INTEGRATION_USER_TYPE"
        );
        await queryRunner.dropTable("user_integration");
    }
}
