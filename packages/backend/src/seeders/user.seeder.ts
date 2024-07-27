/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { WorkspaceSideEffectsService } from "../app/common/workspaces/workspace.side.effects.service";
import { SpacesService } from "../app/common/spaces/spaces.service";
import { Space } from "../app/common/spaces/space.entity";
import { SpaceSideEffectsService } from "../app/common/spaces/space.side.effects.service";
import { ListsService } from "../app/common/lists/lists.service";
import { List } from "../app/common/lists/list.entity";
import { ListSideEffectsService } from "../app/common/lists/list.side.effects.service";
import { ListStagesService } from "../app/common/lists/list-stages/list.stages.service";
import { ListStage } from "../app/common/lists/list-stages/list.stage.entity";
import { ViewsService } from "../app/common/views/views.service";
import { View } from "../app/common/views/view.entity";
import { ProjectUsersService } from "../app/common/projects/project-users/project.users.service";
import { ProjectUser } from "../app/common/projects/project-users/project.user.entity";
import { CardTypesService } from "../app/common/card-types/card.types.service";
import { CardType } from "../app/common/card-types/card.type.entity";
import { CardsService } from "../app/common/cards/cards.service";
import { Card } from "../app/common/cards/card.entity";
import { CardListsService } from "../app/common/cards/card-lists/card.lists.service";
import { CardList } from "../app/common/cards/card-lists/card.list.entity";

const logger = new Logger("UserSeeder");

export async function seedUserData(connection: Connection): Promise<void> {
    const usersService = new UsersService(connection.getRepository(User));
    const viewsService = new ViewsService(connection.getRepository(View));
    const cardListsService = new CardListsService(
        connection.getRepository(CardList)
    );
    const cardsService = new CardsService(
        connection.getRepository(Card),
        cardListsService
    );
    const listStagesService = new ListStagesService(
        connection.getRepository(ListStage),
        cardListsService
    );
    const listSideEffectsService = new ListSideEffectsService(
        listStagesService,
        viewsService
    );
    const listsService = new ListsService(
        connection.getRepository(List),
        listSideEffectsService
    );
    const spaceSideEffectsService = new SpaceSideEffectsService(listsService);
    const spacesService = new SpacesService(
        connection.getRepository(Space),
        spaceSideEffectsService
    );
    const cardTypesService = new CardTypesService(
        connection.getRepository(CardType),
        listsService,
        cardsService
    );
    const workspaceSideEffectsService = new WorkspaceSideEffectsService(
        spacesService,
        cardTypesService
    );
    const workspacesService = new WorkspacesService(
        connection.getRepository(Workspace),
        workspaceSideEffectsService
    );
    const projectUsersService = new ProjectUsersService(
        connection.getRepository(ProjectUser)
    );
    const projectsService = new ProjectsService(
        connection.getRepository(Project),
        projectUsersService
    );

    const email = "dev@tw.com";
    const password = "12345678";
    const workspaceName = "My Workspace";
    const workspaceSlug = "my-workspace";
    const projectName = "Starter Project";

    let user: User;
    let workspace: Workspace;
    let project: Project;

    logger.log("Seeding user data...");

    // Check if test user already exists or not
    const testUser = await usersService.findOneByEmail(email);
    if (testUser) {
        logger.log("Test user already exists, skipping...");
        user = testUser;
    } else {
        user = await usersService.create({
            email,
            password,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            phoneNumber: faker.phone.number(),
        });
        logger.log("Test user created successfully...");
    }

    const testProject = await projectsService.findOneBy({
        where: {
            ownerId: user.id,
            name: projectName,
        },
    });
    if (testProject) {
        logger.log("Test project already exists, skipping...");
        project = testProject;
    } else {
        project = await projectsService.create({
            name: projectName,
            ownerId: user.id,
            users: [
                {
                    role: "owner",
                    user,
                    project: {} as Project,
                },
            ],
        });
        logger.log("Test project created successfully...");
    }

    const testWorkspace = await workspacesService.findOneBy({
        where: { ownerId: user.id, name: workspaceName },
    });
    if (testWorkspace) {
        logger.log("Test workspace already exists, skipping...");
        workspace = testWorkspace;
    } else {
        workspace = await workspacesService.create({
            name: workspaceName,
            slug: workspaceSlug,
            ownerId: user.id,
            type: WorkspaceTypes.PROJECT_MANAGEMENT,
            projectId: project.id,
            createOnboardingData: true,
        });
        logger.log("Test workspace created successfully...");
    }

    logger.log("Email: dev@tw.com", "Password: 12345678");
}
