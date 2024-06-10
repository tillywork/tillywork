import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCardTypeTable1718017084847 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "card_type",
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
                    },
                    {
                        name: "workspaceId",
                        type: "bigint",
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
                foreignKeys: [
                    {
                        columnNames: ["workspaceId"],
                        referencedTableName: "workspace",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
            })
        );

        // Insert 'Task' entries into the card_type table for each workspace
        await queryRunner.query(`
            INSERT INTO "card_type" ("name", "workspaceId", "createdAt", "updatedAt")
            SELECT 'Task', "id", NOW(), NOW()
            FROM "workspace"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("card_type");
    }
}
