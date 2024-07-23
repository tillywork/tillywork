import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Repository } from "typeorm";
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

export interface FindAllParams {
    userId: number;
    projectId: number;
    workspaceId: number;
}

@Injectable()
export class ProjectUserActivitiesService {
    constructor(
        @InjectRepository(ProjectUserActivity)
        private projectUserActivityRepository: Repository<ProjectUserActivity>,
        private projectUsersService: ProjectUsersService,
        private listsService: ListsService,
        private cardsService: CardsService
    ) {}

    async getEntity(
        activity: ProjectUserActivity
    ): Promise<ProjectUserActivityEntity> {
        let entity: ProjectUserActivityEntity;

        if (activity.type === ProjectUserActivityTypes.VIEW) {
            switch (activity.entityType) {
                case ProjectUserActivityEntityTypes.LIST:
                    entity = await this.listsService
                        .findOne(activity.entityId)
                        .catch(() => {
                            return undefined;
                        });
                    break;
                case ProjectUserActivityEntityTypes.CARD:
                    entity = await this.cardsService
                        .findOne(activity.entityId)
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

    async findAll({
        projectId,
        userId,
        workspaceId,
        appendOptions,
        appendSelects,
        appendOrders,
        groupBys,
    }: FindAllParams & {
        appendOptions?: FindManyOptions<ProjectUserActivity>;
        appendSelects?: { column: string; alias?: string }[];
        appendOrders?: { column: string; direction?: "ASC" | "DESC" }[];
        groupBys?: string[];
    }): Promise<ProjectUserActivity[]> {
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

        const queryBuilder = this.projectUserActivityRepository
            .createQueryBuilder("activity")
            .where("activity.projectUserId = :projectUserId", {
                projectUserId: projectUser.id,
            })
            .andWhere("activity.workspaceId = :workspaceId", {
                workspaceId,
            });

        if (groupBys) {
            groupBys.forEach((groupBy, index) => {
                if (index === 0) {
                    queryBuilder.groupBy(`activity.${groupBy}`);
                } else {
                    queryBuilder.addGroupBy(`activity.${groupBy}`);
                }
            });
        }

        if (appendOptions) {
            queryBuilder.setFindOptions(appendOptions);
        }

        if (appendSelects) {
            appendSelects.forEach(({ column, alias }) =>
                queryBuilder.addSelect(column, alias)
            );
        }

        if (appendOrders) {
            appendOrders.forEach(({ column, direction }) =>
                queryBuilder.orderBy(column, direction)
            );
        }

        return queryBuilder.getRawMany();
    }

    async findRecent({
        projectId,
        userId,
        workspaceId,
        limit,
    }: FindAllParams & { limit?: number }): Promise<
        (ProjectUserActivity & { entity?: ProjectUserActivityEntity })[]
    > {
        const activities = await this.findAll({
            projectId,
            userId,
            workspaceId,
            appendOptions: {
                select: ["type", "entityType", "entityId"],
                take: limit ?? 10,
            },
            appendSelects: [
                {
                    column: `MAX("activity"."createdAt")`,
                    alias: "createdAt",
                },
            ],
            appendOrders: [{ column: `"createdAt"`, direction: "DESC" }],
            groupBys: ["type", "entityId", "entityType"],
        });

        return Promise.all(
            activities.map(async (activity: any) => {
                const entity = await this.getEntity({
                    type: activity.activity_type,
                    entityType: activity.activity_entityType,
                    entityId: activity.activity_entityId,
                } as ProjectUserActivity);
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
