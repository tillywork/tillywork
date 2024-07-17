import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
    TableForeignKey,
} from "typeorm";

export class AddWorkspaceIdToCardTable1721207599200
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "card",
            new TableColumn({
                name: "workspaceId",
                type: "bigint",
                isNullable: true,
            })
        );

        await queryRunner.createForeignKey(
            "card",
            new TableForeignKey({
                columnNames: ["workspaceId"],
                referencedTableName: "workspace",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
            })
        );

        await queryRunner.query(`
            UPDATE card
            SET "workspaceId" = (
                SELECT s."workspaceId"
                FROM list l
                JOIN space s ON l."spaceId" = s.id
                JOIN card_list cl ON cl."listId" = l.id
                WHERE cl."cardId" = card.id
                LIMIT 1
            )
            WHERE EXISTS (
                SELECT 1
                FROM list l
                JOIN space s ON l."spaceId" = s.id
                JOIN card_list cl ON cl."listId" = l.id
                WHERE cl."cardId" = card.id
            );
        `);

        await queryRunner.changeColumn(
            "card",
            "workspaceId",
            new TableColumn({
                name: "workspaceId",
                type: "bigint",
                isNullable: false,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("card", "workspaceId");
    }
}
