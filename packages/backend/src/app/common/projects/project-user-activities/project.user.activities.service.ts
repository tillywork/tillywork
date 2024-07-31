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
import { ProjectUsersService } from "../project-users/project.users.service";
import { ListsService } from "../../lists/lists.service";
import { CardsService } from "../../cards/cards.service";
import { ProjectUser } from "../project-users/project.user.entity";
import { List } from "../../lists/list.entity";
import { Card } from "../../cards/card.entity";

export interface FindAllParams {
    userId: number;
    projectId: number;
    workspaceId: number;
}

type EntityRelationParams = {
    entityType: ProjectUserActivityEntityTypes;
    entityId: number;
};

type RecentResult = {
    type: string;
    title: string;
    path: string;
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
        entityType,
        entityId,
    }: EntityRelationParams): Promise<ProjectUserActivityEntity> {
        let entity: ProjectUserActivityEntity;

        switch (entityType) {
            case ProjectUserActivityEntityTypes.LIST:
                entity = await this.listsService.findOne(entityId).catch(() => {
                    return undefined;
                });
                break;
            case ProjectUserActivityEntityTypes.CARD:
                entity = await this.cardsService.findOne(entityId).catch(() => {
                    return undefined;
                });
                break;
            default:
                break;
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
        limit = 5,
    }: FindAllParams & { limit?: number }): Promise<RecentResult[]> {
        const projectUser = await this.findProjectUserByProjectIdAndUserId({
            projectId,
            userId,
        });

        const queryBuilder = this.projectUserActivityRepository
            .createQueryBuilder("activity")
            .where("activity.projectUserId = :projectUserId", {
                projectUserId: projectUser.id,
            })
            .andWhere("activity.workspaceId = :workspaceId", {
                workspaceId,
            })
            .orderBy(`"createdAt"`, "DESC")
            .take(limit);

        const selects = [
            {
                column: "activity.type",
                alias: "type",
            },
            {
                column: "activity.name",
                alias: "name",
            },
            {
                column: "activity.path",
                alias: "path",
            },
            {
                column: "activity.entityType",
                alias: "entityType",
            },
            {
                column: "activity.entityId",
                alias: "entityId",
            },
            {
                column: "MAX(activity.createdAt)",
                alias: "createdAt",
            },
        ];
        selects.forEach(({ column, alias }, index) => {
            if (index === 0) {
                queryBuilder.select(column, alias);
            } else {
                queryBuilder.addSelect(column, alias);
            }
        });

        const groupBys = ["type", "name", "path", "entityId", "entityType"];
        groupBys.forEach((groupBy, index) => {
            if (index === 0) {
                queryBuilder.groupBy(`activity.${groupBy}`);
            } else {
                queryBuilder.addGroupBy(`activity.${groupBy}`);
            }
        });

        const activities = await queryBuilder.getRawMany();
        const activitiesResult = await Promise.all(
            activities.map(async (activity) => {
                let { name: title, path } = activity;
                let type: string = activity.type;

                if (type === ProjectUserActivityTypes.ENTITY) {
                    const entity = await this.getEntity(activity);

                    if (entity instanceof List) {
                        title = entity.name;
                    } else if (entity instanceof Card) {
                        title = entity.title;
                    }

                    type = activity.entityType.toLowerCase();
                    path = `/pm/${type}/${entity.id}`; // TODO-Next: implement workspace slug, and implement entityId OR entitySlug
                }

                if (type && title && path) {
                    return { type, title, path };
                }
            })
        );

        return activitiesResult.filter(Boolean);
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

        let entity: ProjectUserActivityEntity;
        if (projectUserActivity.type === ProjectUserActivityTypes.ENTITY) {
            entity = await this.getEntity({
                entityType: projectUserActivity.entityType,
                entityId: projectUserActivity.entityId,
            });
        }

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
