import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUserTable1716293040055 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "user",
                columns: [
                    {
                        name: "id",
                        type: "bigint",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "email",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                        isUnique: true,
                    },
                    {
                        name: "password",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "firstName",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "lastName",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "phoneNumber",
                        type: "varchar",
                        length: "20",
                        isNullable: true,
                    },
                    {
                        name: "country",
                        type: "char",
                        length: "2",
                        isNullable: true,
                    },
                    {
                        name: "photo",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "roles",
                        type: "varchar",
                        default: "ARRAY['user']",
                        isArray: true,
                    },
                    {
                        name: "onboarding",
                        type: "jsonb",
                        default: `'{}'`,
                    },
                    { name: "createdAt", type: "timestamp", default: "now()" },
                    { name: "updatedAt", type: "timestamp", default: "now()" },
                    { name: "deletedAt", type: "timestamp", isNullable: true },
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("user");
    }
}
