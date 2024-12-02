import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
    TableIndex,
} from "typeorm";

export class CreateAccessControlTable1733140447674
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "access_control",
                columns: [
                    {
                        name: "id",
                        type: "bigint",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "userId",
                        type: "bigint",
                        isNullable: false,
                    },
                    {
                        name: "permissionLevel",
                        type: "enum",
                        enum: ["none", "viewer", "editor", "owner"],
                        default: "'none'",
                    },
                    {
                        name: "projectId",
                        type: "bigint",
                        isNullable: true,
                    },
                    {
                        name: "workspaceId",
                        type: "bigint",
                        isNullable: true,
                    },
                    {
                        name: "spaceId",
                        type: "bigint",
                        isNullable: true,
                    },
                    {
                        name: "listId",
                        type: "bigint",
                        isNullable: true,
                    },
                    {
                        name: "cardId",
                        type: "bigint",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        // Add foreign key constraints
        await queryRunner.createForeignKeys("access_control", [
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
                onDelete: "CASCADE",
            }),
            new TableForeignKey({
                columnNames: ["projectId"],
                referencedColumnNames: ["id"],
                referencedTableName: "project",
                onDelete: "CASCADE",
            }),
            new TableForeignKey({
                columnNames: ["workspaceId"],
                referencedColumnNames: ["id"],
                referencedTableName: "workspace",
                onDelete: "CASCADE",
            }),
            new TableForeignKey({
                columnNames: ["spaceId"],
                referencedColumnNames: ["id"],
                referencedTableName: "space",
                onDelete: "CASCADE",
            }),
            new TableForeignKey({
                columnNames: ["listId"],
                referencedColumnNames: ["id"],
                referencedTableName: "list",
                onDelete: "CASCADE",
            }),
            new TableForeignKey({
                columnNames: ["cardId"],
                referencedColumnNames: ["id"],
                referencedTableName: "card",
                onDelete: "CASCADE",
            }),
        ]);

        await queryRunner.createIndices("access_control", [
            new TableIndex({
                name: "IDX_ACCESS_CONTROL_USER",
                columnNames: ["userId"],
            }),
            new TableIndex({
                name: "IDX_ACCESS_CONTROL_PROJECT",
                columnNames: ["userId", "projectId", "permissionLevel"],
            }),
            new TableIndex({
                name: "IDX_ACCESS_CONTROL_WORKSPACE",
                columnNames: ["userId", "workspaceId", "permissionLevel"],
            }),
            new TableIndex({
                name: "IDX_ACCESS_CONTROL_SPACE",
                columnNames: ["userId", "spaceId", "permissionLevel"],
            }),
            new TableIndex({
                name: "IDX_ACCESS_CONTROL_LIST",
                columnNames: ["userId", "listId", "permissionLevel"],
            }),
            new TableIndex({
                name: "IDX_ACCESS_CONTROL_CARD",
                columnNames: ["userId", "cardId", "permissionLevel"],
            }),
            new TableIndex({
                name: "IDX_ACCESS_CONTROL_CREATED_AT",
                columnNames: ["createdAt"],
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("access_control");
    }
}
