import { MigrationInterface, QueryRunner } from "typeorm";

export class AddListViewType1717363107808 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if 'list' already exists to make the migration idempotent
        const checkExistence = await queryRunner.query(`
            SELECT unnest(enum_range(NULL::view_type_enum)) AS type
        `);

        const exists = checkExistence.find((el) => el.type === "list");

        if (!exists) {
            await queryRunner.query(`
                ALTER TYPE view_type_enum ADD VALUE 'list';
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Optionally define code to handle the migration rollback.
        // Rolling back ENUM types modification in Postgres needed more complex procedures like
        // creating a new type and migrating the data.
        console.warn(
            "Rollback of ENUM type modification isn't straightforward and needs manual intervention if required."
        );
    }
}
