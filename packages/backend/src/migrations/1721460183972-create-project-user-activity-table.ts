import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateProjectUserActivityTable1721460183972
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "project_user_activity",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "projectUserId",
                        type: "bigint", // TODO-Next: Should be uuid
                    },
                    {
                        name: "workspaceId",
                        type: "bigint", // TODO-Next: Should be uuid
                    },
                    {
                        name: "type",
                        type: "enum",
                        enum: ["ENTITY", "SETTING"],
                    },
                    {
                        name: "name",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "path",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "entityId",
                        type: "bigint", // TODO-Next: Should be uuid
                        isNullable: true,
                    },
                    {
                        name: "entityType",
                        type: "enum",
                        enum: ["LIST", "CARD"],
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["projectUserId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: "project_user",
                        onDelete: "CASCADE",
                    },
                    {
                        columnNames: ["workspaceId"],
                        referencedColumnNames: ["id"],
                        referencedTableName: "workspace",
                        onDelete: "CASCADE",
                    },
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("project_user_activity");
    }
}