import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";
import { TWFileType } from "../app/common/files/types";

export class CreateFileTable1720019365225 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "file",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "name",
                        type: "varchar",
                    },
                    {
                        name: "key",
                        type: "varchar",
                        isUnique: true,
                    },
                    {
                        name: "url",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "size",
                        type: "bigint",
                    },
                    {
                        name: "type",
                        type: "enum",
                        enum: Object.values(TWFileType),
                    },
                    {
                        name: "createdById",
                        type: "bigint",
                    },
                    {
                        name: "projectId",
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
                        columnNames: ["createdById"],
                        referencedTableName: "user",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                    {
                        columnNames: ["projectId"],
                        referencedTableName: "project",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
                indices: [
                    new TableIndex({
                        name: "IDX_FILE_CREATED_BY",
                        columnNames: ["createdById"],
                    }),
                    new TableIndex({
                        name: "IDX_FILE_PROJECT",
                        columnNames: ["projectId"],
                    }),
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("file");
    }
}
