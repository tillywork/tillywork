import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddEmailOpenTrackingToEmailTable1724673051203
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "email",
            new TableColumn({
                name: "openTimes",
                type: "timestamp",
                isNullable: true,
                isArray: true,
            })
        );

        await queryRunner.addColumn(
            "email",
            new TableColumn({
                name: "openCount",
                type: "int",
                default: 0,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("email", "openTimes");
        await queryRunner.dropColumn("email", "openCount");
    }
}
