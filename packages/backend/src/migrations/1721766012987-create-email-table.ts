import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { EmailStatus } from "../app/common/mailer/types";

export class CreateEmailTable1721766012987 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "email",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "to",
                        type: "varchar",
                    },
                    {
                        name: "subject",
                        type: "varchar",
                    },
                    {
                        name: "body",
                        type: "text",
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: Object.values(EmailStatus),
                        default: `'${EmailStatus.PENDING}'`,
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
            false,
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("email");
    }
}
