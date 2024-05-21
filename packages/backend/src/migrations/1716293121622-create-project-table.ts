import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from "typeorm";

export class CreateProjectTable1716293121622 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Project table
        await queryRunner.createTable(
            new Table({
                name: "project",
                columns: [
                    {
                        name: "id",
                        type: "bigint",
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
                    { name: "createdAt", type: "timestamp", default: "now()" },
                    { name: "updatedAt", type: "timestamp", default: "now()" },
                ],
            })
        );

        // Create ProjectUser table
        await queryRunner.createTable(
            new Table({
                name: "project_user",
                columns: [
                    {
                        name: "id",
                        type: "bigint",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    { name: "projectId", type: "bigint", isNullable: false },
                    { name: "userId", type: "bigint", isNullable: false },
                    {
                        name: "role",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            })
        );

        // Foreign keys
        await queryRunner.createForeignKey(
            "project_user",
            new TableForeignKey({
                columnNames: ["projectId"],
                referencedColumnNames: ["id"],
                referencedTableName: "project",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "project_user",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const projectUserTable = await queryRunner.getTable("project_user");
        const projectUserProjectForeignKey = projectUserTable?.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("projectId") !== -1
        );
        const projectUserUserForeignKey = projectUserTable?.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("userId") !== -1
        );

        await queryRunner.dropForeignKey(
            "project_user",
            projectUserProjectForeignKey as TableForeignKey
        );
        await queryRunner.dropForeignKey(
            "project_user",
            projectUserUserForeignKey as TableForeignKey
        );

        await queryRunner.dropTable("project_user");
        await queryRunner.dropTable("project");
    }
}
