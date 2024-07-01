import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddInviteCodeToProjectTable1719829250591
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
        await queryRunner.addColumn(
            "project",
            new TableColumn({
                name: "inviteCode",
                type: "varchar",
                length: "32",
                isUnique: true,
                isNullable: true,
                default: `encode(gen_random_bytes(16), 'hex')`,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("project", "inviteCode");
    }
}
