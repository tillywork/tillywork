import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDealToCardTypeLayoutEnum1735135850545
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TYPE "card_type_layout_enum" ADD VALUE IF NOT EXISTS 'deal';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
