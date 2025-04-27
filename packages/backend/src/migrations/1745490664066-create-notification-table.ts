import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateNotificationTable1745490664066
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "notification",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "type",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "recipientId",
                        type: "bigint",
                        isNullable: false,
                    },
                    {
                        name: "relatedResourceId",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "relatedResourceType",
                        type: "varchar",
                        length: "50",
                        isNullable: true,
                    },
                    {
                        name: "color",
                        type: "varchar",
                        length: "50",
                        isNullable: true,
                    },
                    {
                        name: "message",
                        type: "text",
                        isNullable: false,
                    },
                    {
                        name: "isRead",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "workspaceId",
                        type: "bigint",
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
                        columnNames: ["recipientId"],
                        referencedTableName: "user",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                    {
                        columnNames: ["workspaceId"],
                        referencedTableName: "workspace",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
            }),
            true
        );

        await queryRunner.createIndex(
            "notification",
            new TableIndex({
                name: "IDX_NOTIFICATION_RECIPIENT_WORKSPACE",
                columnNames: ["recipientId", "workspaceId"],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex(
            "notification",
            "IDX_NOTIFICATION_RECIPIENT_WORKSPACE"
        );
        await queryRunner.dropTable("notification");
    }
}
