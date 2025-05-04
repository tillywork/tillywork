import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableIndex,
    TableUnique,
} from "typeorm";

export class CreateWatcherTable1745493772123 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "watcher",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "userId",
                        type: "bigint",
                        isNullable: false,
                    },
                    {
                        name: "resourceId",
                        type: "bigint",
                        isNullable: false,
                    },
                    {
                        name: "resourceType",
                        type: "varchar",
                        length: "50",
                        isNullable: false,
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
                foreignKeys: [
                    {
                        columnNames: ["userId"],
                        referencedTableName: "user",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
            }),
            true
        );

        await queryRunner.createIndex(
            "watcher",
            new TableIndex({
                name: "IDX_WATCHER_USER",
                columnNames: ["userId"],
            })
        );

        await queryRunner.createIndex(
            "watcher",
            new TableIndex({
                name: "IDX_WATCHER_RESOURCE",
                columnNames: ["resourceId", "resourceType"],
            })
        );

        await queryRunner.createUniqueConstraint(
            "watcher",
            new TableUnique({
                name: "UQ_WATCHER_USER_RESOURCE",
                columnNames: ["userId", "resourceId", "resourceType"],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropUniqueConstraint(
            "watcher",
            "UQ_WATCHER_USER_RESOURCE"
        );
        await queryRunner.dropIndex("watcher", "IDX_WATCHER_RESOURCE");
        await queryRunner.dropIndex("watcher", "IDX_WATCHER_USER");
        await queryRunner.dropTable("watcher");
    }
}
