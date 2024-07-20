import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from "typeorm";
import { ActionType, TriggerType } from "../app/common/automations/types";

export class CreateAutomationTable1721310306344 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "automation_action",
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
                        type: "enum",
                        enum: Object.values(ActionType),
                    },
                    {
                        name: "data",
                        type: "jsonb",
                    },
                    {
                        name: "automationId",
                        type: "uuid",
                    },
                    {
                        name: "nextActionId",
                        type: "uuid",
                        isNullable: true,
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
            }),
            true
        );

        await queryRunner.createForeignKey(
            "automation_action",
            new TableForeignKey({
                columnNames: ["nextActionId"],
                referencedColumnNames: ["id"],
                referencedTableName: "automation_action",
                onDelete: "SET NULL",
            })
        );

        await queryRunner.createTable(
            new Table({
                name: "automation",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "triggerType",
                        type: "enum",
                        enum: Object.values(TriggerType),
                    },
                    {
                        name: "conditions",
                        type: "jsonb",
                    },
                    {
                        name: "firstActionId",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "workspaceId",
                        type: "bigint",
                    },
                    {
                        name: "createdByType",
                        type: "enum",
                        enum: ["system", "user"],
                        default: "'user'",
                    },
                    {
                        name: "createdById",
                        type: "bigint",
                        isNullable: true,
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
            }),
            true
        );

        await queryRunner.createForeignKey(
            "automation",
            new TableForeignKey({
                columnNames: ["firstActionId"],
                referencedColumnNames: ["id"],
                referencedTableName: "automation_action",
                onDelete: "SET NULL",
            })
        );

        await queryRunner.createForeignKey(
            "automation",
            new TableForeignKey({
                columnNames: ["workspaceId"],
                referencedColumnNames: ["id"],
                referencedTableName: "workspace",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "automation",
            new TableForeignKey({
                columnNames: ["createdById"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("automation");
        await queryRunner.dropTable("automation_action");
    }
}
