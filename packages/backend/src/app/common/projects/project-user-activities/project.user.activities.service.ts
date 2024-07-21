import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
    limit?: number;
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
        limit = 50,
    }: FindAllParams): Promise<ProjectUserActivity[]> {
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

        return this.projectUserActivityRepository.find({
            where: {
                projectUserId: projectUser.id,
                workspaceId,
            },
            order: {
                createdAt: "DESC",
            },
            take: limit,
        });
    }

    async findForRecent({
        projectId,
        userId,
        workspaceId,
        limit = 5,
    }: FindAllParams): Promise<
        (ProjectUserActivity & { entity?: ProjectUserActivityEntity })[]
    > {
        let activities = await this.findAll({
            projectId,
            userId,
            workspaceId,
            limit: limit * 10, // for threshold
        });
        activities = activities
            .reduce((prev, curr, index) => {
                if (index === 0) {
                    prev.push(curr);
                    return prev;
                }

                // NOTE: To deduplicate all entries, consider implementing a Map
                function isSame(
                    activity1: ProjectUserActivity,
                    activity2: ProjectUserActivity
                ) {
                    const { type, entityId, entityType } = activity1;
                    return (
                        type === activity2.type &&
                        entityId === activity2.entityId &&
                        entityType === activity2.entityType
                    );
                }
                if (!isSame(prev[prev.length - 1], curr)) {
                    prev.push(curr);
                }

                return prev;
            }, [])
            .slice(0, limit);

        return Promise.all(activities.map(({ id }) => this.findOne(id)));
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
