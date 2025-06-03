import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { ProjectUser } from "./project.user.entity";
import { CreateProjectUserDto } from "./dto/create.project.user.dto";
import { UpdateProjectUserDto } from "./dto/update.project.user.dto";
import { AccessControlService } from "../../auth/services/access.control.service";
import { ClsService } from "nestjs-cls";
import { PermissionLevel } from "@tillywork/shared";
import { User } from "../../users/user.entity";

export type ProjectUserFindAllResult = {
    total: number;
    projects: ProjectUser[];
};

export type FindAllOptions = {
    projectId: number;
};

@Injectable()
export class ProjectUsersService {
    constructor(
        @InjectRepository(ProjectUser)
        private projectUsersRepository: Repository<ProjectUser>,
        private accessControlService: AccessControlService,
        private clsService: ClsService
    ) {}

    async findAll({ projectId }: FindAllOptions): Promise<ProjectUser[]> {
        const user = this.clsService.get("user");

        await this.accessControlService.authorize(
            user,
            "project",
            projectId,
            PermissionLevel.VIEWER
        );

        return this.projectUsersRepository.find({
            where: {
                project: {
                    id: projectId,
                },
            },
        });
    }

    async findOne(id: number): Promise<ProjectUser> {
        const projectUser = await this.projectUsersRepository.findOne({
            where: { id },
        });
        const user = this.clsService.get("user");

        if (!projectUser) {
            throw new NotFoundException(`ProjectUser with ID ${id} not found`);
        }

        await this.accessControlService.authorize(
            user,
            "project",
            projectUser.project.id,
            PermissionLevel.VIEWER
        );

        return projectUser;
    }

    async findOneBy({
        where,
    }: {
        where: FindOptionsWhere<ProjectUser>;
    }): Promise<ProjectUser> {
        return this.projectUsersRepository.findOne({ where });
    }

    async create(
        createProjectUserDto: CreateProjectUserDto
    ): Promise<ProjectUser> {
        const projectUser =
            this.projectUsersRepository.create(createProjectUserDto);
        await this.projectUsersRepository.save(projectUser);

        await this.accessControlService.grantPermission(
            projectUser.user,
            "project",
            projectUser.project.id,
            projectUser.role === "owner"
                ? PermissionLevel.OWNER
                : PermissionLevel.EDITOR
        );

        return projectUser;
    }

    async update(
        id: number,
        updateProjectUserDto: UpdateProjectUserDto
    ): Promise<ProjectUser> {
        const projectUser = await this.findOne(id);
        this.projectUsersRepository.merge(projectUser, updateProjectUserDto);
        const updatedProjectUser = await this.projectUsersRepository.save(
            projectUser
        );

        await this.accessControlService.grantPermission(
            updatedProjectUser.user,
            "project",
            updatedProjectUser.project.id,
            updatedProjectUser.role === "owner"
                ? PermissionLevel.OWNER
                : PermissionLevel.EDITOR
        );

        return updatedProjectUser;
    }

    async remove(id: number): Promise<void> {
        const projectUser = await this.findOne(id);

        await this.projectUsersRepository.manager.transaction(
            async (manager) => {
                await manager.remove(ProjectUser, projectUser);

                await this.accessControlService.revokePermissions(
                    projectUser.user,
                    "project",
                    projectUser.project.id
                );

                await manager.getRepository(User).update(
                    {
                        id: projectUser.user.id,
                    },
                    {
                        project: null,
                    }
                );
            }
        );
    }
}
