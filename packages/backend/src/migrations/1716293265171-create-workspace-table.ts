import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
    TableIndex,
} from "typeorm";

export class CreateWorkspaceTable1716293265171 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "workspace",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    { name: "ownerId", type: "bigint", isNullable: false },
                    {
                        name: "type",
                        type: "enum",
                        enum: ["crm", "project_management", "agile_projects"],
                        isNullable: false,
                    },
                    { name: "projectId", type: "bigint", isNullable: true },
                    { name: "createdAt", type: "timestamp", default: "now()" },
                    { name: "updatedAt", type: "timestamp", default: "now()" },
                    { name: "deletedAt", type: "timestamp", isNullable: true },
                ],
            })
        );

        // Index for quicker search on commonly accessed columns
        await queryRunner.createIndices("workspace", [
            new TableIndex({
                name: "IDX_WORKSPACE_OWNERID",
                columnNames: ["ownerId"],
            }),
            new TableIndex({
                name: "IDX_WORKSPACE_PROJECTID",
                columnNames: ["projectId"],
            }),
        ]);

        // Foreign keys
        await queryRunner.createForeignKey(
            "workspace",
            new TableForeignKey({
                columnNames: ["projectId"],
                referencedColumnNames: ["id"],
                referencedTableName: "project",
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const workspaceTable = await queryRunner.getTable("workspace");
        const workspaceProjectForeignKey = workspaceTable?.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("projectId") !== -1
        );

        await queryRunner.dropForeignKey(
            "workspace",
            workspaceProjectForeignKey as TableForeignKey
        );
        await queryRunner.dropIndex("workspace", "IDX_WORKSPACE_OWNERID");
        await queryRunner.dropIndex("workspace", "IDX_WORKSPACE_PROJECTID");
        await queryRunner.dropTable("workspace");
    }
}
