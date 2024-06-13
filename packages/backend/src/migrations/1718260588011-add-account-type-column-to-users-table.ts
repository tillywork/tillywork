import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";
import { AccountType } from "../app/common/users/types";

export class AddAccountTypeColumnToUsersTable1718260588011
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "user",
            new TableColumn({
                name: "accountType",
                type: "enum",
                enum: Object.values(AccountType),
                default: `'${AccountType.EMAIL}'`,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("user", "accountType");
    }
}
