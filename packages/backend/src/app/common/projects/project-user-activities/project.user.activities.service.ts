import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOptionsWhere, Repository } from "typeorm";
import { ProjectUserActivity } from "./project.user.activity.entity";
import { CreateProjectUserActivityDto } from "./dto/create.project.user.activity.dto";
import {
    ProjectUserActivityEntity,
    ProjectUserActivityEntityTypes,
    ProjectUserActivityTypes,
} from "../types";
import { ProjectUser } from "../project-users/project.user.entity";
import { ProjectUsersService } from "../project-users/project.users.service";
import { ListsService } from "../../lists/lists.service";
import { CardsService } from "../../cards/cards.service";

export interface FindAllParams {
    userId: number;
    projectId: number;
    workspaceId: number;
}

type EntityRelationParams = {
    type: ProjectUserActivityTypes;
    entityType: ProjectUserActivityEntityTypes;
    entityId: number;
};

@Injectable()
export class ProjectUserActivitiesService {
    constructor(
        @InjectRepository(ProjectUserActivity)
        private projectUserActivityRepository: Repository<ProjectUserActivity>,
        private projectUsersService: ProjectUsersService,
        private listsService: ListsService,
        private cardsService: CardsService
    ) {}

    async getEntity({
        type,
        entityType,
        entityId,
    }: EntityRelationParams): Promise<ProjectUserActivityEntity> {
        let entity: ProjectUserActivityEntity;

        if (type === ProjectUserActivityTypes.VIEW) {
            switch (entityType) {
                case ProjectUserActivityEntityTypes.LIST:
                    entity = await this.listsService
                        .findOne(entityId)
                        .catch(() => {
                            return undefined;
                        });
                    break;
                case ProjectUserActivityEntityTypes.CARD:
                    entity = await this.cardsService
                        .findOne(entityId)
                        .catch(() => {
                            return undefined;
                        });
                    break;
                default:
                    break;
            }
        }

        return entity;
    }

    async findProjectUserByProjectIdAndUserId({
        projectId,
        userId,
    }: Omit<FindAllParams, "workspaceId">): Promise<ProjectUser> {
        const projectUser = await this.projectUsersService.findOneBy({
            where: {
                project: { id: projectId },
                user: { id: userId },
            },
        });
        if (!projectUser) {
            throw new NotFoundException(
                `ProjectUser with (project ID ${projectId} and user ID ${userId}) not found`
            );
        }
        return projectUser;
    }

    async findAll({
        projectId,
        userId,
        workspaceId,
        findWhere,
        findOptions,
    }: FindAllParams & {
        findWhere?: FindOptionsWhere<ProjectUserActivity>;
        findOptions?: FindManyOptions<ProjectUserActivity>;
    }): Promise<ProjectUserActivity[]> {
        const projectUser = await this.findProjectUserByProjectIdAndUserId({
            projectId,
            userId,
        });

        return this.projectUserActivityRepository.find({
            where: {
                projectUserId: projectUser.id,
                workspaceId,
                ...findWhere,
            },
            ...findOptions,
        });
    }

    async findRecent({
        projectId,
        userId,
        workspaceId,
        limit,
    }: FindAllParams & { limit?: number }): Promise<
        (EntityRelationParams & { entity?: ProjectUserActivityEntity })[]
    > {
        const projectUser = await this.findProjectUserByProjectIdAndUserId({
            projectId,
            userId,
        });

        const query = `
			select
				"activity"."type",
				"activity"."entityId",
				"activity"."entityType",
				MAX("activity"."createdAt") as "createdAt"
			from
				"project_user_activity" "activity"
			where
				"activity"."projectUserId" = $1
				and "activity"."workspaceId" = $2
			group by
				"activity"."type",
				"activity"."entityId",
				"activity"."entityType"
			order by
				"createdAt" desc
			limit $3
		`;
        const activities: EntityRelationParams[] =
            await this.projectUserActivityRepository.query(query, [
                projectUser.id,
                workspaceId,
                limit ?? 10,
            ]);

        return Promise.all(
            activities.map(async (activity) => {
                const entity = await this.getEntity(activity);
                return { ...activity, entity };
            })
        );
    }

    async findOne(
        id: string
    ): Promise<ProjectUserActivity & { entity?: ProjectUserActivityEntity }> {
        const projectUserActivity =
            await this.projectUserActivityRepository.findOne({
                where: { id },
            });
        if (!projectUserActivity) {
            throw new NotFoundException(
                `ProjectUserActivity with ID ${id} not found`
            );
        }

        const entity = await this.getEntity(projectUserActivity);
        return { ...projectUserActivity, entity };
    }

    async create({
        projectId,
        userId,
        ...rest
    }: CreateProjectUserActivityDto): Promise<ProjectUserActivity> {
        const projectUser = await this.projectUsersService.findOneBy({
            where: {
                project: { id: projectId },
                user: { id: userId },
            },
        });
        if (!projectUser) {
            throw new NotFoundException(
                `ProjectUser with (project ID ${projectId} and user ID ${userId}) not found`
            );
        }

        const projectUserActivity = this.projectUserActivityRepository.create({
            ...rest,
            projectUser,
        });
        await this.projectUserActivityRepository.save(projectUserActivity);

        return projectUserActivity;
    }
}
