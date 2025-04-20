import { LocationType } from "@tillywork/shared";
import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
    TableIndex,
} from "typeorm";

export class CreateAutomationTable1738236462639 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "automation_step",
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
                    },
                    {
                        name: "value",
                        type: "varchar",
                        isNullable: true,
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
                        name: "nextStepId",
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
            "automation_step",
            new TableForeignKey({
                columnNames: ["nextStepId"],
                referencedColumnNames: ["id"],
                referencedTableName: "automation_step",
                onDelete: "CASCADE",
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
                        name: "isEnabled",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "triggerId",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "workspaceId",
                        type: "bigint",
                    },
                    {
                        name: "createdByType",
                        type: "varchar",
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
            "automation_step",
            new TableForeignKey({
                name: "FK_AUTOMATION_STEP_AUTOMATION",
                columnNames: ["automationId"],
                referencedColumnNames: ["id"],
                referencedTableName: "automation",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "automation",
            new TableForeignKey({
                columnNames: ["triggerId"],
                referencedColumnNames: ["id"],
                referencedTableName: "automation_step",
                onDelete: "CASCADE",
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
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createTable(
            new Table({
                name: "automation_run",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "status",
                        type: "varchar",
                        default: `'pending'`,
                    },
                    {
                        name: "error",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "startedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "automationId",
                        type: "uuid",
                    },
                ],
            }),
            true
        );

        await queryRunner.createTable(
            new Table({
                name: "automation_step_run",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "order",
                        type: "int",
                    },
                    {
                        name: "input",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "output",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "status",
                        type: "varchar",
                        default: `'pending'`,
                    },
                    {
                        name: "error",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "executedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "duration",
                        type: "float",
                        isNullable: true,
                    },
                    {
                        name: "runId",
                        type: "uuid",
                    },
                    {
                        name: "stepId",
                        type: "uuid",
                    },
                ],
            }),
            true
        );

        await queryRunner.createForeignKeys("automation_run", [
            new TableForeignKey({
                columnNames: ["automationId"],
                referencedTableName: "automation",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
            }),
        ]);

        await queryRunner.createForeignKeys("automation_step_run", [
            new TableForeignKey({
                columnNames: ["runId"],
                referencedTableName: "automation_run",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
            }),
            new TableForeignKey({
                columnNames: ["stepId"],
                referencedTableName: "automation_step",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
            }),
        ]);

        await queryRunner.createIndices("automation_run", [
            new TableIndex({
                name: "IDX_AUTOMATION_RUN_STATUS",
                columnNames: ["status"],
            }),
            new TableIndex({
                name: "IDX_AUTOMATION_RUN_TIMESTAMP",
                columnNames: ["startedAt"],
            }),
            new TableIndex({
                name: "IDX_AUTOMATION_RUN_COMPOSITE",
                columnNames: ["automationId", "status"],
            }),
        ]);

        await queryRunner.createIndices("automation_step_run", [
            new TableIndex({
                name: "IDX_STEP_RUN_ORDER",
                columnNames: ["runId", "order"],
            }),
            new TableIndex({
                name: "IDX_STEP_RUN_STEP",
                columnNames: ["stepId"],
            }),
            new TableIndex({
                name: "IDX_STEP_RUN_STATUS",
                columnNames: ["status"],
            }),
        ]);

        await queryRunner.createTable(
            new Table({
                name: "automation_location",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "locationId",
                        type: "bigint",
                    },
                    {
                        name: "locationType",
                        type: "enum",
                        enum: Object.values(LocationType),
                    },
                    {
                        name: "automationId",
                        type: "uuid",
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

        await queryRunner.createForeignKey(
            "automation_location",
            new TableForeignKey({
                name: "FK_AUTOMATION_LOCATION_AUTOMATION",
                columnNames: ["automationId"],
                referencedTableName: "automation",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createIndices("automation_location", [
            new TableIndex({
                name: "IDX_AUTOMATION_LOCATION_AUTOMATION",
                columnNames: ["automationId"],
            }),
            new TableIndex({
                name: "IDX_AUTOMATION_LOCATION_LOCATION",
                columnNames: ["locationId", "locationType"],
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("automation_location");
        await queryRunner.dropTable("automation_step_run");
        await queryRunner.dropTable("automation_run");
        await queryRunner.dropForeignKey(
            "automation_step",
            "FK_AUTOMATION_STEP_AUTOMATION"
        );
        await queryRunner.dropTable("automation");
        await queryRunner.dropTable("automation_step");
    }
}
