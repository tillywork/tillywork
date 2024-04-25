import { Connection } from "typeorm";
import { UsersService } from "../app/common/users/users.service";
import { User } from "../app/common/users/user.entity";
import { faker } from "@faker-js/faker";
import { Logger } from "@nestjs/common";
import { WorkspacesService } from "../app/common/workspaces/workspaces.service";
import { Workspace } from "../app/common/workspaces/workspace.entity";
import { Project } from "../app/common/projects/project.entity";
import { ProjectsService } from "../app/common/projects/projects.service";
import { WorkspaceTypes } from "../app/common/workspaces/types";

const logger = new Logger("UserSeeder");

export async function seedUserData(connection: Connection): Promise<void> {
    const usersService = new UsersService(connection.getRepository(User));
    const workspacesService = new WorkspacesService(connection.getRepository(Workspace));
    const projectsService = new ProjectsService(connection.getRepository(Project));

    const email = "dev@fd.com";
    const password = "12345678";
    const workspaceName = "My Workspace";
    const projectName = "Starter Project";

    let user: User;
    let workspace: Workspace;
    let project: Project;

    logger.log("Seeding user data...");
    logger.log("Email: dev@fd.com", "Password: 12345678");

    // Check if test user already exists or not
    const testUser = await usersService.findOneByEmail(email);
    if (testUser) {
        logger.log("Test user already exists, skipping...");
        user = testUser;
    }
    else {
        user = await usersService.create({
            email,
            password,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
        });
        logger.log("Test user created successfully...");
    }

    const testProject = await projectsService.findOneBy({
        where: {
            ownerId: user.id,
            name: projectName
        }
    });
    if (testProject) {
        logger.log("Test project already exists, skipping...");
        project = testProject;
    }
    else {
        project = await projectsService.create({
            name: projectName,
            ownerId: user.id,
        });
        logger.log("Test project created successfully...");
    }

    const testWorkspace = await workspacesService.findOneBy({ where: { ownerId: user.id, name: workspaceName } });
    if (testWorkspace) {
        logger.log("Test workspace already exists, skipping...");
        workspace = testWorkspace;
    }
    else {
        workspace = await workspacesService.create({
            name: workspaceName,
            ownerId: user.id,
            workspaceType: WorkspaceTypes.PROJECT_MANAGEMENT,
            projectId: project.id,
        });
        logger.log("Test workspace created successfully...");
    }
}