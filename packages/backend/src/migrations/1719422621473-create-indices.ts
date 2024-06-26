import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class CreateIndices1719422621473 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Indices for quicker search on commonly accessed columns
        await queryRunner.createIndices("workspace", [
            new TableIndex({
                name: "IDX_WORKSPACE_ID",
                columnNames: ["id"],
            }),
        ]);

        await queryRunner.createIndices("card_type", [
            new TableIndex({
                name: "IDX_CARD_TYPE_WORKSPACE",
                columnNames: ["workspaceId"],
            }),
            new TableIndex({
                name: "IDX_CARD_TYPE_CREATED_BY_TYPE",
                columnNames: ["createdByType"],
            }),
            new TableIndex({
                name: "IDX_CARD_TYPE_CREATED_BY",
                columnNames: ["createdById"],
            }),
        ]);

        await queryRunner.createIndices("card", [
            new TableIndex({
                name: "IDX_CARD_TYPE",
                columnNames: ["typeId"],
            }),
            new TableIndex({
                name: "IDX_CARD_CREATED_BY",
                columnNames: ["createdById"],
            }),
            new TableIndex({
                name: "IDX_CARD_STARTS_AT",
                columnNames: ["startsAt"],
            }),
            new TableIndex({
                name: "IDX_CARD_DUE_AT",
                columnNames: ["dueAt"],
            }),
        ]);
        await queryRunner.query(
            `CREATE INDEX "IDX_CARD_DATA" ON "card" USING gin ("data")`
        );

        await queryRunner.createIndices("card_list", [
            new TableIndex({
                name: "IDX_CARD_LIST_LIST_STAGE",
                columnNames: ["listStageId"],
            }),
            new TableIndex({
                name: "IDX_CARD_LIST_CARD",
                columnNames: ["cardId"],
            }),
            new TableIndex({
                name: "IDX_CARD_LIST_LIST",
                columnNames: ["listId"],
            }),
        ]);

        await queryRunner.createIndices("card_activity", [
            new TableIndex({
                name: "IDX_CARD_ACTIVITY_CARD",
                columnNames: ["cardId"],
            }),
            new TableIndex({
                name: "IDX_CARD_ACTIVITY_TYPE",
                columnNames: ["type"],
            }),
            new TableIndex({
                name: "IDX_CARD_ACTIVITY_CREATED_BY",
                columnNames: ["createdById"],
            }),
        ]);

        await queryRunner.createIndices("field", [
            new TableIndex({
                name: "IDX_FIELD_WORKSPACE_ID",
                columnNames: ["workspaceId"],
            }),
        ]);

        await queryRunner.createIndices("filter", [
            new TableIndex({
                name: "IDX_FILTER_ENTITY",
                columnNames: ["entityId", "entityType"],
            }),
        ]);

        await queryRunner.createIndices("list", [
            new TableIndex({
                name: "IDX_LIST_SPACE_ID",
                columnNames: ["spaceId"],
            }),
        ]);

        await queryRunner.createIndices("list_stage", [
            new TableIndex({
                name: "IDX_LIST_STAGE_LIST_ID",
                columnNames: ["listId"],
            }),
            new TableIndex({
                name: "IDX_LIST_STAGE_IS_COMPLETED",
                columnNames: ["isCompleted"],
            }),
        ]);

        await queryRunner.createIndices("list_group", [
            new TableIndex({
                name: "IDX_LIST_GROUP_LIST_ID",
                columnNames: ["listId"],
            }),
            new TableIndex({
                name: "IDX_LIST_GROUP_ENTITY",
                columnNames: ["entityType", "entityId"],
            }),
        ]);

        await queryRunner.createIndices("project", [
            new TableIndex({
                name: "IDX_PROJECT_OWNER_ID",
                columnNames: ["ownerId"],
            }),
        ]);

        await queryRunner.createIndices("project_user", [
            new TableIndex({
                name: "IDX_PROJECT_USER_USER_ID",
                columnNames: ["userId"],
            }),
        ]);

        await queryRunner.createIndices("space", [
            new TableIndex({
                name: "IDX_SPACE_WORKSPACE_ID",
                columnNames: ["workspaceId"],
            }),
        ]);

        await queryRunner.createIndices("view", [
            new TableIndex({
                name: "IDX_VIEW_LIST_ID",
                columnNames: ["listId"],
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex("workspace", "IDX_WORKSPACE_ID");

        await queryRunner.dropIndex("card_type", "IDX_CARD_TYPE_WORKSPACE");
        await queryRunner.dropIndex(
            "card_type",
            "IDX_CARD_TYPE_CREATED_BY_TYPE"
        );
        await queryRunner.dropIndex("card_type", "IDX_CARD_TYPE_CREATED_BY");

        await queryRunner.dropIndex("card", "IDX_CARD_TYPE");
        await queryRunner.dropIndex("card", "IDX_CARD_CREATED_BY");
        await queryRunner.dropIndex("card", "IDX_CARD_STARTS_AT");
        await queryRunner.dropIndex("card", "IDX_CARD_DUE_AT");
        await queryRunner.query(`DROP INDEX "IDX_CARD_DATA"`);

        await queryRunner.dropIndex("card_list", "IDX_CARD_LIST_LIST_STAGE");
        await queryRunner.dropIndex("card_list", "IDX_CARD_LIST_CARD");
        await queryRunner.dropIndex("card_list", "IDX_CARD_LIST_LIST");

        await queryRunner.dropIndex("card_activity", "IDX_CARD_ACTIVITY_CARD");
        await queryRunner.dropIndex("card_activity", "IDX_CARD_ACTIVITY_TYPE");
        await queryRunner.dropIndex(
            "card_activity",
            "IDX_CARD_ACTIVITY_CREATED_BY"
        );

        await queryRunner.dropIndex("field", "IDX_FIELD_WORKSPACE_ID");

        await queryRunner.dropIndex("filter", "IDX_FILTER_ENTITY");

        await queryRunner.dropIndex("list", "IDX_LIST_SPACE_ID");

        await queryRunner.dropIndex("list_stage", "IDX_LIST_STAGE_LIST_ID");
        await queryRunner.dropIndex(
            "list_stage",
            "IDX_LIST_STAGE_IS_COMPLETED"
        );

        await queryRunner.dropIndex("list_group", "IDX_LIST_GROUP_LIST_ID");
        await queryRunner.dropIndex("list_group", "IDX_LIST_GROUP_ENTITY");

        await queryRunner.dropIndex("project", "IDX_PROJECT_OWNER_ID");

        await queryRunner.dropIndex("project_user", "IDX_PROJECT_USER_USER_ID");

        await queryRunner.dropIndex("space", "IDX_SPACE_WORKSPACE_ID");

        await queryRunner.dropIndex("view", "IDX_VIEW_LIST_ID");
    }
}
