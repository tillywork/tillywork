import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedInitAccessControls1733140464829 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Migrate project owners to access control
        await queryRunner.query(`
            INSERT INTO access_control (
                "userId", 
                "projectId", 
                "permissionLevel", 
                "createdAt"
            )
            SELECT 
                "ownerId", 
                id, 
                'owner', 
                CURRENT_TIMESTAMP
            FROM project
        `);

        // Migrate project users to access control
        await queryRunner.query(`
            INSERT INTO access_control (
                "userId", 
                "projectId", 
                "permissionLevel", 
                "createdAt"
            )
            SELECT 
                pu."userId", 
                pu."projectId", 
                'editor', 
                CURRENT_TIMESTAMP
            FROM project_user pu
            LEFT JOIN access_control ac 
                ON ac."userId" = pu."userId" 
                AND ac."projectId" = pu."projectId"
            WHERE ac.id IS NULL
        `);

        // Migrate workspace owners to access control
        await queryRunner.query(`
            INSERT INTO access_control (
                "userId", 
                "workspaceId", 
                "permissionLevel", 
                "createdAt"
            )
            SELECT 
                "ownerId", 
                id, 
                'owner'::access_control_permissionlevel_enum, 
                CURRENT_TIMESTAMP
            FROM workspace
        `);

        // Migrate project users to workspace access control
        await queryRunner.query(`
            INSERT INTO access_control (
                "userId", 
                "workspaceId", 
                "permissionLevel", 
                "createdAt"
            )
            SELECT DISTINCT
                wu."userId", 
                w.id, 
                'editor'::access_control_permissionlevel_enum, 
                CURRENT_TIMESTAMP
            FROM workspace w
            JOIN project p ON p.id = w."projectId"
            JOIN project_user wu ON wu."projectId" = p.id
            LEFT JOIN access_control ac 
                ON ac."userId" = wu."userId" 
                AND ac."workspaceId" = w.id
            WHERE ac.id IS NULL
        `);

        // Migrate project owner to space access control
        await queryRunner.query(`
            INSERT INTO access_control (
                "userId", 
                "spaceId", 
                "permissionLevel", 
                "createdAt"
            )
            SELECT DISTINCT
                p."ownerId", 
                s.id, 
                'owner'::access_control_permissionlevel_enum, 
                CURRENT_TIMESTAMP
            FROM space s
            JOIN workspace w ON w.id = s."workspaceId"
            JOIN project p ON p.id = w."projectId"
            LEFT JOIN access_control ac 
                ON ac."userId" = p."ownerId" 
                AND ac."spaceId" = s.id
            WHERE ac.id IS NULL
        `);

        // Migrate project users to space access control
        await queryRunner.query(`
            INSERT INTO access_control (
                "userId", 
                "spaceId", 
                "permissionLevel", 
                "createdAt"
            )
            SELECT DISTINCT
                pu."userId", 
                s.id, 
                'editor'::access_control_permissionlevel_enum, 
                CURRENT_TIMESTAMP
            FROM space s
            JOIN workspace w ON w.id = s."workspaceId"
            JOIN project p ON p.id = w."projectId"
            JOIN project_user pu ON pu."projectId" = p.id
            LEFT JOIN access_control ac 
                ON ac."userId" = pu."userId" 
                AND ac."spaceId" = s.id
            WHERE ac.id IS NULL
        `);

        // Migrate project owner to list access control
        await queryRunner.query(`
            INSERT INTO access_control (
                "userId", 
                "listId", 
                "permissionLevel", 
                "createdAt"
            )
            SELECT DISTINCT
                p."ownerId", 
                l.id, 
                'owner'::access_control_permissionlevel_enum, 
                CURRENT_TIMESTAMP
            FROM list l
            LEFT JOIN space s on s.id = l."spaceId"
            JOIN workspace w ON w.id = s."workspaceId" or w.id = l."workspaceId"
            JOIN project p ON p.id = w."projectId"
            LEFT JOIN access_control ac 
                ON ac."userId" = p."ownerId" 
                AND ac."listId" = l.id
            WHERE ac.id IS NULL
        `);

        // Migrate project users to list access control
        await queryRunner.query(`
            INSERT INTO access_control (
                "userId", 
                "listId", 
                "permissionLevel", 
                "createdAt"
            )
            SELECT DISTINCT
                pu."userId", 
                l.id, 
                'editor'::access_control_permissionlevel_enum, 
                CURRENT_TIMESTAMP
            FROM list l
            LEFT JOIN space s on s.id = l."spaceId"
            JOIN workspace w ON w.id = s."workspaceId" or w.id = l."workspaceId"
            JOIN project p ON p.id = w."projectId"
            JOIN project_user pu ON pu."projectId" = p.id
            LEFT JOIN access_control ac 
                ON ac."userId" = pu."userId" 
                AND ac."listId" = l.id
            WHERE ac.id IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM access_control`);
    }
}
