import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { Project } from "./project.entity";
import { CreateProjectDto } from "./dto/create.project.dto";
import { UpdateProjectDto } from "./dto/update.project.dto";
import { ProjectUsersService } from "./project-users/project.users.service";
import { AuthService } from "../auth/auth.service";
import { PermissionLevel } from "@tillywork/shared";
import { ClsService } from "nestjs-cls";

export type ProjectFindAllResult = {
    total: number;
    projects: Project[];
};

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectsRepository: Repository<Project>,
        private projectUsersService: ProjectUsersService,
        @Inject(forwardRef(() => AuthService))
        private authService: AuthService,
        private clsService: ClsService
    ) {}

    async findAll(where?: FindOptionsWhere<Project>): Promise<Project[]> {
        return this.projectsRepository.find({
            where,
        });
    }

    async findOne(id: number): Promise<Project> {
        const user = this.clsService.get("user");
        await this.authService.authorize(
            user,
            "project",
            id,
            PermissionLevel.VIEWER
        );

        const project = await this.projectsRepository.findOne({
            where: { id },
        });

        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        return project;
    }

    async findOneBy({
        where,
    }: {
        where: FindOptionsWhere<Project>;
    }): Promise<Project> {
        const project = await this.projectsRepository.findOne({ where });
        const user = this.clsService.get("user");

        await this.authService.authorize(
            user,
            "project",
            project.id,
            PermissionLevel.VIEWER
        );

        return project;
    }

    async create(createProjectDto: CreateProjectDto): Promise<Project> {
        const project = this.projectsRepository.create(createProjectDto);
        await this.projectsRepository.save(project);

        await Promise.all(
            createProjectDto.users.map((projectUser) =>
                this.projectUsersService.create({
                    ...projectUser,
                    project,
                })
            )
        );

        return project;
    }

    async update(
        id: number,
        updateProjectDto: UpdateProjectDto
    ): Promise<Project> {
        const user = this.clsService.get("user");

        await this.authService.authorize(
            user,
            "project",
            id,
            PermissionLevel.OWNER
        );

        const project = await this.findOne(id);

        this.projectsRepository.merge(project, updateProjectDto);
        return this.projectsRepository.save(project);
    }

    async remove(id: number): Promise<void> {
        const user = this.clsService.get("user");

        await this.authService.authorize(
            user,
            "project",
            id,
            PermissionLevel.EDITOR
        );

        const project = await this.findOne(id);

        await this.projectsRepository.remove(project);
    }
}
