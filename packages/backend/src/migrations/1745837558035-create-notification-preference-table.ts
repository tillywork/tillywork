import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableUnique,
    TableForeignKey,
} from "typeorm";

export class CreateNotificationPreferenceTable1745837558035
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "notification_preference",
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
                        name: "channel",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "enabled",
                        type: "boolean",
                        isNullable: false,
                        default: true,
                    },
                    {
                        name: "config",
                        type: "jsonb",
                        isNullable: false,
                        default: "'{}'",
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
            }),
            true
        );

        await queryRunner.createUniqueConstraint(
            "notification_preference",
            new TableUnique({
                name: "UQ_NOTIFICATION_PREFERENCE_USER_CHANNEL",
                columnNames: ["userId", "channel"],
            })
        );

        await queryRunner.createForeignKey(
            "notification_preference",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedTableName: "user",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
            })
        );

        // Insert in-app notification preference for all users
        await queryRunner.query(`
            INSERT INTO notification_preference (id, "userId", channel, enabled, config, "createdAt", "updatedAt")
            SELECT uuid_generate_v4(), id, 'in_app', true, '{}'::jsonb, now(), now()
            FROM "user"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropUniqueConstraint(
            "notification_preference",
            "UQ_NOTIFICATION_PREFERENCE_USER_CHANNEL"
        );
        await queryRunner.dropTable("notification_preference");
    }
}
